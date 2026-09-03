import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';

async function resolveLocationName(event: { location: string | null; locationId: string | null }) {
  if (event.location) return event.location;
  if (event.locationId) {
    const loc = await prisma.location.findUnique({ where: { id: event.locationId } });
    if (loc) return loc.title;
  }
  return 'Siehe Website';
}

// Run every day at 08:00 AM
export const startCronJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily reminder cron job...');

    try {
      const { transporter, config: mailConfig, isTestMode } = await getNewsletterTransporter();
      const fromHeader = mailConfig?.fromEmail
        ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>`
        : '"Flugschule Hirondelle" <info@fs-hirondelle.de>';

      // --- 1. Reminder emails: events starting in exactly 3 days ---
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const upcomingEvents = await prisma.event.findMany({
        where: { startDate: { gte: targetDate, lt: nextDay } },
        include: { bookings: { where: { status: 'CONFIRMED' }, include: { user: true } } }
      });

      console.log(`Found ${upcomingEvents.length} events starting in 3 days.`);

      for (const event of upcomingEvents) {
        const locationName = await resolveLocationName(event);
        for (const booking of event.bookings) {
          const customer = booking.customerDetails as any;
          const customerEmail = customer ? customer.email : (booking.user ? booking.user.email : null);
          const customerName = customer ? `${customer.firstName} ${customer.lastName}` : (booking.user ? booking.user.name : 'Kunde');
          if (!customerEmail) continue;

          const info = await transporter.sendMail({
            from: fromHeader,
            to: customerEmail,
            subject: `Erinnerung: ${event.title} beginnt in 3 Tagen!`,
            html: `
              <h3>Hallo ${customerName},</h3>
              <p>wir freuen uns auf Ihre Teilnahme an <strong>${event.title}</strong>!</p>
              <p>Die Veranstaltung beginnt am ${new Date(event.startDate).toLocaleDateString('de-DE')}.</p>
              <p>Ort: ${locationName}</p>
              <br/>
              <p>Wir wünschen Ihnen viel Spaß und einen guten Flug!</p>
              <br/>
              <p>Ihr Team der Flugschule Hirondelle</p>
            `
          });
          if (isTestMode) console.log(`Reminder sent to ${customerEmail} (test mode, no real SMTP configured yet):`, info.messageId);
        }
      }

      // --- 2. Post-event rating request: events that ended yesterday ---
      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

      const endedEvents = await prisma.event.findMany({
        where: {
          OR: [
            { endDate: { gte: yesterdayStart, lt: yesterdayEnd } },
            { endDate: null, startDate: { gte: yesterdayStart, lt: yesterdayEnd } }
          ]
        },
        include: { bookings: { where: { status: { not: 'CANCELLED' } }, include: { user: true } } }
      });

      console.log(`Found ${endedEvents.length} events that ended yesterday - sending rating requests.`);

      for (const event of endedEvents) {
        for (const booking of event.bookings) {
          if (booking.rating != null) continue; // already rated
          const customer = booking.customerDetails as any;
          const customerEmail = customer ? customer.email : (booking.user ? booking.user.email : null);
          const customerName = customer ? `${customer.firstName} ${customer.lastName}` : (booking.user ? booking.user.name : 'Kunde');
          if (!customerEmail) continue;

          const baseUrl = process.env.FRONTEND_URL || 'https://www.fs-hirondelle.de';
          const info = await transporter.sendMail({
            from: fromHeader,
            to: customerEmail,
            subject: `Wie war "${event.title}"? Ihre Meinung ist uns wichtig!`,
            html: `
              <h3>Hallo ${customerName},</h3>
              <p>vielen Dank für Ihre Teilnahme an <strong>${event.title}</strong>!</p>
              <p>Wir würden uns sehr über Ihre Bewertung freuen:</p>
              <p><a href="${baseUrl}/bewertung/${booking.id}" style="display:inline-block;padding:10px 20px;background:#5bc0de;color:#fff;text-decoration:none;border-radius:4px;">Jetzt bewerten</a></p>
              <br/>
              <p>Ihr Team der Flugschule Hirondelle</p>
            `
          });
          if (isTestMode) console.log(`Rating request sent to ${customerEmail} (test mode, no real SMTP configured yet):`, info.messageId);
        }
      }

    } catch (error) {
      console.error('Error running reminder cron job:', error);
    }
  });
};
