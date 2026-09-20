import nodemailer from 'nodemailer';
import { prisma } from '../utils/prisma';
import { generateInvoicePDF, generateTicketPDF } from './pdf.service';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';
import { resolveBookingCustomer } from '../utils/bookingCustomer';
import { getSettingsConfig } from '../routes/settingsConfig.routes';

export async function sendBookingConfirmationEmail(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: true,
        user: true,
        items: { include: { ticket: true } }
      }
    });

    if (!booking) {
      console.error('Booking not found for mailer');
      return;
    }

    // old: sendmail_teilnehmer - matches this session's Settings audit finding
    // that the new app had no way to turn the customer's own confirmation
    // email off, unlike old's real admin capability.
    const settings = await getSettingsConfig();
    if (!settings.sendmailTeilnehmer) {
      console.log('Booking confirmation email skipped: sendmailTeilnehmer is disabled in Settings.');
    } else {
      await sendCustomerConfirmationEmail(booking, settings);
    }

    // old: sendmail_owner - a copy of every new booking sent to the school
    // itself, off by default on the real site (and here) since it has no
    // meaningful default recipient until an admin sets one.
    if (settings.sendmailOwner && settings.ownerNotificationEmail) {
      await sendOwnerNotificationEmail(booking, settings.ownerNotificationEmail).catch(console.error);
    }
  } catch (error) {
    console.error('Error in sendBookingConfirmationEmail:', error);
  }
}

async function sendCustomerConfirmationEmail(booking: any, settings: { sendmailInvoice: boolean; sendmailTicket: boolean }) {
  try {
    const bookingId = booking.id;
    // Generate PDFs - only the ones the admin has actually enabled sending.
    const invoiceBuffer = settings.sendmailInvoice ? await generateInvoicePDF(bookingId) : null;
    const ticketBuffer = settings.sendmailTicket ? await generateTicketPDF(bookingId) : null;

    let config = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
    
    let template = config?.emails ? (config.emails as any).bookingConfirmation : null;

    if (!template) {
      console.warn('Booking confirmation template missing in DB. Using fallback template.');
      // Matches old Matukio's real, live mail_booking template content
      // (hiron_matukio_templates.tmpl_name='mail_booking') - not generic
      // placeholder text. The payment terms, waitlist policy, bank details
      // and insurance recommendation are actual business content every
      // customer needs, not decoration; the earlier default text here
      // silently dropped all of it.
      template = {
        subject: 'Buchungsbestätigung: {EVENT_TITLE}',
        bodyHtml: `
          <h3>Hallo {BOOKING_NAME},</h3>
          <p>vielen Dank für Ihre Buchung.</p>
          <br/>
          {EVENT_DETAILS}
          <br/>
          {BOOKING_DETAILS}
          <br/>
          <p>Im Anhang finden Sie Ihre Rechnung und Ihr Ticket.</p>
          <hr/>
          <p>Die Kursgebühr wird 4 Wochen vor Kursbeginn fällig. Bei Kurzfristbuchungen (ab vier Wochen vor Kursbeginn) wird der gesamte Kurspreis sofort fällig.</p>
          <p>Wir führen eine echte Warteliste (der Kurs ist dann tatsächlich ausgebucht). Buchungen auf Warteliste sind daher erst zu bezahlen, wenn die Teilnahme auch sicher - und der Platz verbindlich bestätigt ist.</p>
          <p><strong>Bankverbindung</strong><br/>
          Kontoinhaber: Alexander Schlink<br/>
          Sparkasse Südpfalz<br/>
          IBAN: DE32 5485 0010 1700 1976 41<br/>
          BIC: SOLADES1SUW</p>
          <hr/>
          <p style="color: #ff0000;">Wir empfehlen zur Absicherung für Stornos / Absagen den Abschluss einer Seminarversicherung bzw. für unsere mehrtätigen Kurse / Reisen zusätzlich eine Reiseversicherung. Infos dazu findet ihr auf unserer Seite <a href="https://www.fs-hirondelle.de/infos/versicherungen" style="color: #ff0000;">https://www.fs-hirondelle.de/infos/versicherungen</a>.</p>
          <hr/>
          <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>
        `
      };
    }

    // Prepare placeholders
    const { name: customerName, email: customerEmail } = resolveBookingCustomer(booking);

    if (!customerEmail) {
      console.error('Customer email missing');
      return;
    }

    let locationName = booking.event.location || 'Siehe Website';
    if (!booking.event.location && booking.event.locationId) {
      const loc = await prisma.location.findUnique({ where: { id: booking.event.locationId } });
      if (loc) locationName = loc.title;
    }

    const eventDetails = `
      <strong>Veranstaltung:</strong> ${booking.event.title}<br/>
      <strong>Datum:</strong> ${new Date(booking.event.startDate).toLocaleDateString('de-DE')}${booking.event.endDate ? ` bis ${new Date(booking.event.endDate).toLocaleDateString('de-DE')}` : ''}<br/>
      <strong>Ort:</strong> ${locationName}
    `;

    let ticketRows = '';
    let itemsTotal = 0;
    booking.items.forEach((item: any) => {
      itemsTotal += item.quantity * item.ticket.price;
      ticketRows += `<li>${item.quantity}x ${item.ticket.name} (${item.ticket.price} €)</li>`;
    });
    // Tickets are listed at full price above; if a voucher/tiered-fee
    // discount was applied, totalPrice is lower than that sum - show the
    // discount explicitly so the numbers in the email actually add up.
    const discount = itemsTotal - booking.totalPrice;
    const discountRow = discount > 0.01
      ? `<strong>Rabatt:</strong> -${discount.toFixed(2)} €<br/>`
      : '';

    const bookingDetails = `
      <strong>Buchungs-ID:</strong> ${booking.id}<br/>
      <strong>Tickets:</strong><ul>${ticketRows}</ul>
      ${discountRow}<strong>Gesamtpreis:</strong> ${booking.totalPrice} €
    `;

    // Replace placeholders in subject and body
    let subject = template.subject.replace(/{EVENT_TITLE}/g, booking.event.title);
    let bodyHtml = template.bodyHtml
      .replace(/{BOOKING_NAME}/g, customerName)
      .replace(/{EVENT_TITLE}/g, booking.event.title)
      .replace(/{EVENT_DETAILS}/g, eventDetails)
      .replace(/{BOOKING_DETAILS}/g, bookingDetails);

    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
    if (invoiceBuffer) attachments.push({ filename: `Rechnung_${booking.id.split('-')[0].toUpperCase()}.pdf`, content: invoiceBuffer, contentType: 'application/pdf' });
    if (ticketBuffer) attachments.push({ filename: `Ticket_${booking.id.split('-')[0].toUpperCase()}.pdf`, content: ticketBuffer, contentType: 'application/pdf' });

    const { transporter, isTestMode, testAccountUser, config: mailConfig } = await getNewsletterTransporter();
    const info = await transporter.sendMail({
      from: mailConfig?.fromEmail ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
      to: customerEmail,
      subject: subject,
      html: bodyHtml,
      attachments
    });

    console.log('Booking confirmation email sent: %s', info.messageId);
    if (isTestMode) {
      console.log('No real SMTP configured yet (AcyMailing > Konfiguration) - test preview URL:', nodemailer.getTestMessageUrl(info), testAccountUser);
    }

  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
}

// old: sendmail_owner - a plain internal-facing copy of a new booking, no
// PDF attachments or old's own MAT_* template needed for this since it's
// just an operational alert, not customer-facing correspondence.
async function sendOwnerNotificationEmail(booking: any, ownerEmail: string) {
  const { name: customerName, email: customerEmail } = resolveBookingCustomer(booking);
  const { transporter, config: mailConfig } = await getNewsletterTransporter();
  await transporter.sendMail({
    from: mailConfig?.fromEmail ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
    to: ownerEmail,
    subject: `Neue Buchung: ${booking.event.title}`,
    html: `
      <p>Neue Buchung eingegangen:</p>
      <p><strong>Veranstaltung:</strong> ${booking.event.title}<br/>
      <strong>Kunde:</strong> ${customerName} (${customerEmail || 'keine E-Mail'})<br/>
      <strong>Gesamtpreis:</strong> ${booking.totalPrice} €<br/>
      <strong>Buchungs-ID:</strong> ${booking.id}</p>
    `,
  });
  console.log('Owner notification email sent to', ownerEmail);
}

// old: sendmail_newevent_group - notifies every registered customer when a
// genuinely new event is created and published. Old's real trigger targets
// a specific Joomla user GROUP (=1 on the live site); this app has no
// group/ACL system to match that against (an earlier session finding - all
// real events use a single uniform access level), so this instead notifies
// every real CUSTOMER-role user, matching the spirit of "registered
// members" the setting targets.
export async function sendNewEventNotificationEmail(eventId: string) {
  try {
    const settings = await getSettingsConfig();
    if (!settings.sendmailNewEventGroup) return;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return;

    const config = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
    let template = config?.emails ? (config.emails as any).newEvent : null;
    if (!template) {
      template = {
        subject: 'Neue Veranstaltung: {EVENT_TITLE}',
        bodyHtml: `
          <h3>Hallo {USER_NAME},</h3>
          <p>es gibt eine neue Veranstaltung:</p>
          <br/>
          {EVENT_DETAILS}
          <br/>
          <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>
        `
      };
    }

    let locationName = event.location || 'Siehe Website';
    if (!event.location && event.locationId) {
      const loc = await prisma.location.findUnique({ where: { id: event.locationId } });
      if (loc) locationName = loc.title;
    }
    const eventDetails = `
      <strong>Veranstaltung:</strong> ${event.title}<br/>
      <strong>Datum:</strong> ${new Date(event.startDate).toLocaleDateString('de-DE')}${event.endDate ? ` bis ${new Date(event.endDate).toLocaleDateString('de-DE')}` : ''}<br/>
      <strong>Ort:</strong> ${locationName}
    `;

    const recipients = await prisma.user.findMany({
      where: { role: 'CUSTOMER', email: { not: '' } },
      select: { name: true, email: true },
    });
    if (recipients.length === 0) return;

    const { transporter, config: mailConfig } = await getNewsletterTransporter();
    const subject = template.subject.replace(/{EVENT_TITLE}/g, event.title);
    for (const recipient of recipients) {
      const bodyHtml = template.bodyHtml
        .replace(/{USER_NAME}/g, recipient.name || 'Kunde')
        .replace(/{EVENT_TITLE}/g, event.title)
        .replace(/{EVENT_DETAILS}/g, eventDetails);
      await transporter.sendMail({
        from: mailConfig?.fromEmail ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
        to: recipient.email,
        subject,
        html: bodyHtml,
      }).catch(console.error);
    }
    console.log(`New-event notification sent to ${recipients.length} customers for event ${event.title}`);
  } catch (error) {
    console.error('Error sending new-event notification email:', error);
  }
}

// templateKey 'userCancellation' - the customer cancelled their own booking;
// 'adminCancellation' - the school/admin cancelled the booking on their behalf.
export async function sendCancellationEmail(bookingId: string, templateKey: 'userCancellation' | 'adminCancellation') {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true, user: true }
    });

    if (!booking) {
      console.error('Booking not found for cancellation mailer');
      return;
    }

    // old: notify_participants_cancel
    const settings = await getSettingsConfig();
    if (!settings.notifyParticipantsCancel) {
      console.log('Cancellation email skipped: notifyParticipantsCancel is disabled in Settings.');
      return;
    }

    const config = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
    let template = config?.emails ? (config.emails as any)[templateKey] : null;

    if (!template) {
      template = templateKey === 'userCancellation'
        ? {
            subject: 'Stornierungsbestätigung für {EVENT_TITLE}',
            bodyHtml: '<p>Hallo {BOOKING_NAME},</p><p>Ihre Stornierung wurde erfolgreich bearbeitet.</p><p>{EVENT_DETAILS}</p>'
          }
        : {
            subject: 'Stornierung Ihrer Buchung für {EVENT_TITLE}',
            bodyHtml: '<p>Hallo {BOOKING_NAME},</p><p>leider müssen wir Ihre Buchung stornieren.</p><p>{EVENT_DETAILS}</p>'
          };
    }

    const { name: customerName, email: customerEmail } = resolveBookingCustomer(booking);

    if (!customerEmail) {
      console.error('Customer email missing for cancellation mailer');
      return;
    }

    let locationName = booking.event.location || 'Siehe Website';
    if (!booking.event.location && booking.event.locationId) {
      const loc = await prisma.location.findUnique({ where: { id: booking.event.locationId } });
      if (loc) locationName = loc.title;
    }

    const eventDetails = `
      <strong>Veranstaltung:</strong> ${booking.event.title}<br/>
      <strong>Datum:</strong> ${new Date(booking.event.startDate).toLocaleDateString('de-DE')}${booking.event.endDate ? ` bis ${new Date(booking.event.endDate).toLocaleDateString('de-DE')}` : ''}<br/>
      <strong>Ort:</strong> ${locationName}<br/>
      <strong>Buchungs-ID:</strong> ${booking.id}
    `;

    const subject = template.subject.replace(/{EVENT_TITLE}/g, booking.event.title);
    const bodyHtml = template.bodyHtml
      .replace(/{BOOKING_NAME}/g, customerName)
      .replace(/{EVENT_TITLE}/g, booking.event.title)
      .replace(/{EVENT_DETAILS}/g, eventDetails);

    const { transporter, isTestMode, testAccountUser, config: mailConfig } = await getNewsletterTransporter();
    const info = await transporter.sendMail({
      from: mailConfig?.fromEmail ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
      to: customerEmail,
      subject,
      html: bodyHtml
    });

    console.log('Cancellation email sent (%s): %s', templateKey, info.messageId);
    if (isTestMode) {
      console.log('No real SMTP configured yet (AcyMailing > Konfiguration) - test preview URL:', nodemailer.getTestMessageUrl(info), testAccountUser);
    }
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
}
