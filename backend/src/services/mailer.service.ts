import nodemailer from 'nodemailer';
import { prisma } from '../utils/prisma';
import { generateInvoicePDF, generateTicketPDF } from './pdf.service';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';
import { resolveBookingCustomer } from '../utils/bookingCustomer';

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

    // Generate PDFs
    const invoiceBuffer = await generateInvoicePDF(bookingId);
    const ticketBuffer = await generateTicketPDF(bookingId);

    let config = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
    
    let template = config?.emails ? (config.emails as any).bookingConfirmation : null;

    if (!template) {
      console.warn('Booking confirmation template missing in DB. Using fallback template.');
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
    booking.items.forEach(item => {
      ticketRows += `<li>${item.quantity}x ${item.ticket.name} (${item.ticket.price} €)</li>`;
    });

    const bookingDetails = `
      <strong>Buchungs-ID:</strong> ${booking.id}<br/>
      <strong>Tickets:</strong><ul>${ticketRows}</ul>
      <strong>Gesamtpreis:</strong> ${booking.totalPrice} €
    `;

    // Replace placeholders in subject and body
    let subject = template.subject.replace(/{EVENT_TITLE}/g, booking.event.title);
    let bodyHtml = template.bodyHtml
      .replace(/{BOOKING_NAME}/g, customerName)
      .replace(/{EVENT_TITLE}/g, booking.event.title)
      .replace(/{EVENT_DETAILS}/g, eventDetails)
      .replace(/{BOOKING_DETAILS}/g, bookingDetails);

    const { transporter, isTestMode, testAccountUser, config: mailConfig } = await getNewsletterTransporter();
    const info = await transporter.sendMail({
      from: mailConfig?.fromEmail ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
      to: customerEmail,
      subject: subject,
      html: bodyHtml,
      attachments: [
        {
          filename: `Rechnung_${booking.id.split('-')[0].toUpperCase()}.pdf`,
          content: invoiceBuffer,
          contentType: 'application/pdf'
        },
        {
          filename: `Ticket_${booking.id.split('-')[0].toUpperCase()}.pdf`,
          content: ticketBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log('Booking confirmation email sent: %s', info.messageId);
    if (isTestMode) {
      console.log('No real SMTP configured yet (AcyMailing > Konfiguration) - test preview URL:', nodemailer.getTestMessageUrl(info), testAccountUser);
    }

  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
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
