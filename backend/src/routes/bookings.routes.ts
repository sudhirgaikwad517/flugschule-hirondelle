import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin, AuthRequest } from '../middlewares/auth.middleware';
import { sendBookingConfirmationEmail, sendCancellationEmail } from '../services/mailer.service';
import { calculateBookingPrice } from '../utils/bookingPrice';
import { JWT_SECRET } from '../utils/config';
import jwt from 'jsonwebtoken';
import { resolveBookingCustomer } from '../utils/bookingCustomer';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';
import { buildBookingPlaceholders, renderMatTokens, parseCsvTemplateTokens, friendlyColumnName, htmlTemplateToLines } from '../utils/matukioTemplates';

const router = Router();

import { generateInvoicePDF, generateTicketPDF, generateNameTagPDF, generateCertificatePDF } from '../services/pdf.service';

router.get('/my-bookings', authenticateJWT, async (req: any, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        event: true,
        items: { include: { ticket: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Post-event rating - reachable via the unguessable booking id itself as the
// link token (matches Matukio's uuid-token rating link), no login required.
// Only allowed once the event has actually finished, and only once.
router.get('/:id/rating-info', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: { event: { select: { title: true, startDate: true, endDate: true } } }
    });
    if (!booking) return res.status(404).json({ message: 'Not found' });

    const eventEnd = booking.event.endDate || booking.event.startDate;
    res.json({
      eventTitle: booking.event.title,
      eventEnded: new Date() >= new Date(eventEnd),
      alreadyRated: booking.rating != null,
      rating: booking.rating,
      ratingComment: booking.ratingComment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/rate', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 6) {
      return res.status(400).json({ message: 'Bewertung muss zwischen 1 und 6 liegen' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: { event: { select: { startDate: true, endDate: true } } }
    });
    if (!booking) return res.status(404).json({ message: 'Not found' });

    const eventEnd = booking.event.endDate || booking.event.startDate;
    if (new Date() < new Date(eventEnd)) {
      return res.status(400).json({ message: 'Eine Bewertung ist erst nach der Veranstaltung möglich' });
    }
    if (booking.rating != null) {
      return res.status(400).json({ message: 'Diese Buchung wurde bereits bewertet' });
    }

    await prisma.booking.update({
      where: { id: req.params.id as string },
      data: { rating: ratingNum, ratingComment: comment || null }
    });

    res.json({ message: 'Vielen Dank für Ihre Bewertung' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fellow-participants list for one event - only visible to a logged-in user
// who has a non-cancelled booking on that same event (matches Matukio's
// isViewTeilnehmer gating, and never exposes email/address, just names).
router.get('/event/:eventId/participants', authenticateJWT, async (req: any, res) => {
  try {
    const { eventId } = req.params;
    const ownBooking = await prisma.booking.findFirst({
      where: { eventId, userId: req.user.id, status: { not: 'CANCELLED' } }
    });
    if (!ownBooking) {
      return res.status(403).json({ message: 'Nur für gebuchte Teilnehmer sichtbar' });
    }

    const bookings = await prisma.booking.findMany({
      where: { eventId, status: { not: 'CANCELLED' } },
      select: { id: true, customerDetails: true }
    });

    const participants = bookings.map(b => {
      const c = (b.customerDetails as any) || {};
      const name = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Teilnehmer';
      return { name };
    });

    res.json(participants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/invoice', authenticateJWT, async (req: any, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Unauthorized' });

    const pdfBuffer = await generateInvoicePDF(booking.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Rechnung_${booking.id.split('-')[0].toUpperCase()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
});

router.get('/:id/ticket', authenticateJWT, async (req: any, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Unauthorized' });

    const pdfBuffer = await generateTicketPDF(booking.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Ticket_${booking.id.split('-')[0].toUpperCase()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating ticket' });
  }
});

// Matukio's "Active or Floating" status dropdown - `all`/`activeandpending` are
// pseudo-values that expand to several real statuses; `paid`/`unpaid` are
// alternate values of the SAME dropdown (not a separate filter), matching a
// boolean rather than the status column.
const STATUS_PSEUDO: Record<string, string[] | undefined> = {
  activeandpending: ['CONFIRMED', 'PENDING'],
  active: ['CONFIRMED'],
  pending: ['PENDING'],
  waitlist: ['WAITLIST'],
  archived: ['COMPLETED'],
  deleted: ['CANCELLED'],
};

function buildBookingWhereClause(query: any) {
  const { q, status, eventId, time, ids } = query;
  const whereClause: any = {};
  const andConditions: any[] = [];

  if (ids) {
    whereClause.id = { in: String(ids).split(',') };
    return whereClause;
  }

  if (q) {
    const qStr = String(q);
    const idMatch = qStr.match(/^id:(.+)$/i);
    if (idMatch) {
      whereClause.id = idMatch[1].trim();
    } else {
      andConditions.push({
        OR: [
          { user: { name: { contains: qStr } } },
          { user: { email: { contains: qStr } } },
          { customerDetails: { path: '$.name', string_contains: qStr } },
          { customerDetails: { path: '$.firstName', string_contains: qStr } },
          { customerDetails: { path: '$.lastName', string_contains: qStr } },
          { customerDetails: { path: '$.email', string_contains: qStr } },
        ],
      });
    }
  }

  if (eventId) whereClause.eventId = eventId;

  if (status) {
    if (status === 'paid') whereClause.paid = true;
    else if (status === 'unpaid') whereClause.paid = false;
    else if (status !== 'all') {
      const mapped = STATUS_PSEUDO[String(status)];
      whereClause.status = mapped ? { in: mapped } : status;
    }
  } else {
    // Matukio's default view is "Active and Pending" until the admin picks
    // something else.
    whereClause.status = { in: ['CONFIRMED', 'PENDING'] };
  }

  if (time && time !== 'all') {
    const now = new Date();
    const daysByPeriod: Record<string, number> = { day: 1, week: 7, month: 30, year: 365 };
    const days = daysByPeriod[String(time)];
    if (days) whereClause.createdAt = { gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000) };
  }

  if (andConditions.length) whereClause.AND = andConditions;
  return whereClause;
}

function serializeBookingForList(b: any) {
  const { name: customerName, email: customerEmail } = resolveBookingCustomer(b);
  const bookedSeats = (b.items || []).reduce((sum: number, i: any) => sum + i.quantity, 0);
  return {
    ...b,
    customerName,
    customerEmail,
    bookedSeats,
    shortId: b.id.replace(/-/g, '').slice(0, 10).toUpperCase(),
  };
}

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;

    const whereClause = buildBookingWhereClause(req.query);

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          user: true,
          event: true,
          items: { include: { ticket: true } }
        },
        skip,
        take,
        orderBy
      }),
      prisma.booking.count({ where: whereClause })
    ]);

    res.set('Content-Range', `bookings ${skip}-${skip + bookings.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(bookings.map(serializeBookingForList));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Bulk toolbar actions (mirrors the old Matukio admin toolbar) ---

router.post('/bulk/activate', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.booking.updateMany({ where: { id: { in: ids } }, data: { status: 'CONFIRMED' } });
    for (const id of ids) sendBookingConfirmationEmail(id).catch(console.error);
    res.json({ message: `${ids.length} Buchung(en) aktiviert.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/bulk/pending', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.booking.updateMany({ where: { id: { in: ids } }, data: { status: 'PENDING' } });
    for (const id of ids) sendBookingConfirmationEmail(id).catch(console.error);
    res.json({ message: `${ids.length} Buchung(en) auf ausstehend gesetzt.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/bulk/reject', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { ids, subject, message } = req.body as { ids: string[]; subject: string; message: string };
    const bookings = await prisma.booking.findMany({
      where: { id: { in: ids } },
      include: { event: true, user: true },
    });

    const { transporter, config: mailConfig } = await getNewsletterTransporter();
    for (const booking of bookings) {
      const { name, email } = resolveBookingCustomer(booking);
      if (!email) continue;
      const personalizedSubject = subject.replace(/\{EVENT_TITLE\}/g, booking.event.title).replace(/\{BOOKING_NAME\}/g, name);
      const personalizedMessage = message
        .replace(/\{EVENT_TITLE\}/g, booking.event.title)
        .replace(/\{BOOKING_NAME\}/g, name);
      await transporter.sendMail({
        from: mailConfig?.fromEmail ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
        to: email,
        subject: personalizedSubject,
        html: personalizedMessage.replace(/\n/g, '<br/>'),
      }).catch(console.error);
    }

    await prisma.booking.updateMany({ where: { id: { in: ids } }, data: { status: 'CANCELLED' } });
    res.json({ message: `${ids.length} Buchung(en) abgelehnt.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/bulk/wastebasket', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.booking.updateMany({ where: { id: { in: ids } }, data: { status: 'CANCELLED' } });
    for (const id of ids) sendCancellationEmail(id, 'adminCancellation').catch(console.error);
    res.json({ message: `${ids.length} Buchung(en) in den Papierkorb verschoben.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// "Empty trash" - real, irreversible deletion. Only meant to be used from the
// UI once the list is filtered to Storniert/deleted, but that's a UI-level
// guard, not something this endpoint itself restricts.
router.post('/bulk/empty-trash', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.booking.deleteMany({ where: { id: { in: ids } } });
    res.json({ message: `${ids.length} Buchung(en) endgültig gelöscht.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/bulk/certificate', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { ids, issue } = req.body as { ids: string[]; issue: boolean };
    await prisma.booking.updateMany({ where: { id: { in: ids } }, data: { certificated: !!issue } });

    if (issue) {
      const templatesConfig = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
      const cert = templatesConfig?.certificates as any;
      if (cert?.emailSubject && cert?.emailBody) {
        const bookings = await prisma.booking.findMany({ where: { id: { in: ids } }, include: { event: true, user: true } });
        const { transporter, config: mailConfig } = await getNewsletterTransporter();
        for (const booking of bookings) {
          const { email } = resolveBookingCustomer(booking);
          if (!email) continue;
          const placeholders = buildBookingPlaceholders(booking);
          const subject = renderMatTokens(cert.emailSubject, placeholders);
          const html = renderMatTokens(cert.emailBody, placeholders);
          const pdfBuffer = await generateCertificatePDF(booking.id).catch(() => null);
          await transporter.sendMail({
            from: mailConfig?.fromEmail ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
            to: email,
            subject,
            html,
            attachments: pdfBuffer ? [{ filename: `Zertifikat_${placeholders.MAT_BOOKING_NUMBER}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }] : undefined,
          }).catch(console.error);
        }
      }
    }

    res.json({ message: issue ? `${ids.length} Zertifikat(e) ausgestellt.` : `${ids.length} Zertifikat(e) widerrufen.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/bulk/checkin', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.booking.updateMany({ where: { id: { in: ids } }, data: { checkedIn: true } });
    res.json({ message: `${ids.length} Teilnehmer eingecheckt.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/bulk/contact', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { ids, subject, message } = req.body as { ids: string[]; subject: string; message: string };
    const bookings = await prisma.booking.findMany({
      where: { id: { in: ids } },
      include: { event: { include: { Organizer: true } }, user: true },
    });

    const { transporter, config: mailConfig } = await getNewsletterTransporter();
    let sent = 0;
    for (const booking of bookings) {
      const { email } = resolveBookingCustomer(booking);
      if (!email) continue;
      await transporter.sendMail({
        from: mailConfig?.fromEmail ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
        replyTo: booking.event.Organizer?.email || undefined,
        to: email,
        subject,
        html: message.replace(/\n/g, '<br/>'),
      }).catch(console.error);
      sent++;
    }
    res.json({ message: `Nachricht an ${sent} Teilnehmer gesendet.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Per-row "Paid" toggle. Matukio side effect: marking a booking paid while it
// isn't already confirmed auto-activates it.
router.put('/:id/paid', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { paid } = req.body as { paid: boolean };
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id as string } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const shouldActivate = paid && existing.status === 'PENDING';
    const booking = await prisma.booking.update({
      where: { id: req.params.id as string },
      data: { paid: !!paid, ...(shouldActivate ? { status: 'CONFIRMED' } : {}) },
    });
    if (shouldActivate) sendBookingConfirmationEmail(booking.id).catch(console.error);
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Exports / print views ---

router.get('/export/csv', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const whereClause = buildBookingWhereClause(req.query);
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: { event: true, user: true, items: { include: { ticket: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const templatesConfig = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
    const csvTemplate = (templatesConfig?.csvXml as any)?.csvTemplate as string | undefined;

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    let header: string[];
    let rows: string[][];

    if (csvTemplate && csvTemplate.trim()) {
      // Admin-configured template (Vorlagen > CSV und XML): a single row of
      // MAT_* tokens, e.g. "MAT_BOOKING_NAME;MAT_BOOKING_EMAIL;MAT_EVENT_TITLE".
      const tokens = parseCsvTemplateTokens(csvTemplate);
      header = tokens.map(friendlyColumnName);
      rows = bookings.map((b) => {
        const placeholders = buildBookingPlaceholders(b);
        return tokens.map((t) => placeholders[t] ?? t);
      });
    } else {
      header = ['ID', 'Name', 'E-Mail', 'Event', 'Buchungsdatum', 'Plätze', 'Bezahlt', 'Status', 'Gesamtpreis'];
      rows = bookings.map((b) => {
        const { name, email } = resolveBookingCustomer(b);
        const seats = b.items.reduce((s, i) => s + i.quantity, 0);
        return [
          b.id,
          name,
          email || '',
          b.event.title,
          new Date(b.createdAt).toLocaleString('de-DE'),
          String(seats),
          b.paid ? 'Ja' : 'Nein',
          b.status,
          b.totalPrice.toFixed(2),
        ];
      });
    }

    const csv = [header, ...rows].map((r) => r.map(escape).join(';')).join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=buchungen.csv');
    res.send('﻿' + csv); // BOM so Excel opens UTF-8 correctly
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

function renderPrintList(title: string, bookings: any[], withSignatureColumn: boolean, tableOnly = false) {
  const rows = bookings.map((b) => {
    const { name, email } = resolveBookingCustomer(b);
    const seats = b.items.reduce((s: number, i: any) => s + i.quantity, 0);
    return `
      <tr>
        <td>${name}</td>
        <td>${email || ''}</td>
        <td>${b.event.title}</td>
        <td>${new Date(b.event.startDate).toLocaleDateString('de-DE')}</td>
        <td>${seats}</td>
        ${withSignatureColumn ? '<td class="sig-cell"></td>' : ''}
      </tr>`;
  }).join('');

  const table = `
  <style>
    table.mat-print-list { width: 100%; border-collapse: collapse; margin-top: 16px; }
    table.mat-print-list th, table.mat-print-list td { border: 1px solid #999; padding: 6px 10px; text-align: left; font-size: 13px; }
    table.mat-print-list .sig-cell { width: 160px; }
  </style>
  <table class="mat-print-list">
    <thead><tr><th>Name</th><th>E-Mail</th><th>Event</th><th>Datum</th><th>Plätze</th>${withSignatureColumn ? '<th>Unterschrift</th>' : ''}</tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

  if (tableOnly) return table;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 24px; }
  h1 { font-size: 18px; }
  @media print { body { margin: 0; } }
</style>
</head><body>
  <h1>${title}</h1>
  ${table}
  <script>window.onload = () => window.print();</script>
</body></html>`;
}

// If the admin configured a template (Vorlagen > Listen-Ansichten), it's a
// full-page HTML document with a ##COM_MATUKIO_..._LIST## marker showing
// where the generated table should be inserted - giving the admin control
// over branding/styling/print layout while the row data itself stays
// reliable/consistent. Falls back to the built-in fixed layout if no
// template is set, or the marker isn't present in it.
function renderWithTemplate(template: string | undefined, marker: string, title: string, bookings: any[], withSignatureColumn: boolean) {
  const generatedTable = renderPrintList(title, bookings, withSignatureColumn, true);
  if (template && template.trim()) {
    const withTable = template.includes(marker) ? template.replace(marker, generatedTable) : template + generatedTable;
    return withTable.includes('<html') ? withTable : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${withTable}<script>window.onload=()=>window.print();</script></body></html>`;
  }
  return renderPrintList(title, bookings, withSignatureColumn, false);
}

router.get('/export/participant-list', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const whereClause = buildBookingWhereClause(req.query);
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: { event: true, user: true, items: { include: { ticket: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const templatesConfig = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
    const template = (templatesConfig?.listViews as any)?.participantList as string | undefined;
    res.send(renderWithTemplate(template, '##COM_MATUKIO_PARTICIPANTS_LIST##', 'Teilnehmerliste', bookings, false));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/export/signature-list', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const whereClause = buildBookingWhereClause(req.query);
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: { event: true, user: true, items: { include: { ticket: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const templatesConfig = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
    const template = (templatesConfig?.listViews as any)?.signatureList as string | undefined;
    res.send(renderWithTemplate(template, '##COM_MATUKIO_SIGNATURE_LIST##', 'Unterschriftenliste', bookings, true));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/name-tag', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const pdfBuffer = await generateNameTagPDF(req.params.id as string);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Namensschild_${String(req.params.id).split('-')[0].toUpperCase()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating name tag' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ 
      where: { id: req.params.id as string }, 
      include: { 
        user: true, 
        event: true,
        items: { include: { ticket: true } }
      } 
    });
    if (!booking) return res.status(404).json({ message: 'Not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req: any, res) => {
  try {
    // Optional Authentication
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (err) {
        // Ignore invalid token, treat as guest
      }
    }

    // Extract voucherCode - totalPrice/finalPrice from the client are
    // intentionally discarded here and recomputed server-side below, never trusted.
    const { items, customerDetails, paymentMethod, remarks, eventId, voucherCode, totalPrice: _clientTotalPrice, finalPrice: _clientFinalPrice, ...bookingData } = req.body;
    delete bookingData.totalPrice;

    // Check Event Deadline
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Authoritative price calculation (tiered-fee + voucher discounts applied server-side)
    const priceResult = await calculateBookingPrice(eventId, items, voucherCode, !!req.user);

    if (voucherCode && !priceResult.appliedVoucherCode) {
      return res.status(400).json({ message: 'Ungültiger Gutschein' });
    }

    if (priceResult.appliedVoucherCode) {
      await prisma.voucher.update({
        where: { code: priceResult.appliedVoucherCode },
        data: { usedCount: { increment: 1 } }
      });
      if (customerDetails) {
        customerDetails.appliedVoucher = priceResult.appliedVoucherCode;
      }
    }

    // Determine Status (WAITLIST if any ticket exceeds capacity)
    let finalStatus = 'PENDING';
    if (items && items.length > 0) {
      for (const item of items) {
        const ticket = await prisma.eventTicket.findUnique({
          where: { id: item.ticketId },
          include: { items: { include: { booking: { select: { status: true } } } } }
        });
        if (ticket) {
          const bookedCount = ticket.items
            .filter(i => i.booking.status !== 'CANCELLED')
            .reduce((sum, i) => sum + i.quantity, 0);
          
          if (bookedCount + Number(item.quantity) > ticket.capacity) {
            finalStatus = 'WAITLIST';
            break; // Entire booking goes to waitlist
          }
        }
      }
    }

    const booking = await prisma.booking.create({
      data: {
        ...bookingData,
        eventId,
        userId: req.user?.id,
        status: finalStatus as any,
        totalPrice: priceResult.finalPrice,
        customerDetails: customerDetails ?? undefined,
        paymentMethod: paymentMethod ?? undefined,
        remarks: remarks ?? undefined,
        items: items ? {
          create: items.map((i: any) => ({
            ticketId: i.ticketId,
            quantity: Number(i.quantity)
          }))
        } : undefined
      },
      include: { items: { include: { ticket: true } } }
    });

    // Send confirmation email asynchronously
    sendBookingConfirmationEmail(booking.id).catch(console.error);

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public booking route for guests
router.post('/public', async (req, res) => {
  try {
    const { items, eventId, customerDetails, paymentMethod, remarks, voucherCode } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Authoritative price calculation - never trust a client-submitted totalPrice.
    const priceResult = await calculateBookingPrice(eventId, items, voucherCode, false);

    if (voucherCode && !priceResult.appliedVoucherCode) {
      return res.status(400).json({ message: 'Ungültiger Gutschein' });
    }

    if (priceResult.appliedVoucherCode) {
      await prisma.voucher.update({
        where: { code: priceResult.appliedVoucherCode },
        data: { usedCount: { increment: 1 } }
      });
      if (customerDetails) {
        customerDetails.appliedVoucher = priceResult.appliedVoucherCode;
      }
    }

    // Determine Status (WAITLIST if any ticket exceeds capacity)
    let finalStatus = 'PENDING';
    if (items && items.length > 0) {
      for (const item of items) {
        const ticket = await prisma.eventTicket.findUnique({
          where: { id: item.ticketId },
          include: { items: { include: { booking: { select: { status: true } } } } }
        });
        if (ticket) {
          const bookedCount = ticket.items
            .filter(i => i.booking.status !== 'CANCELLED')
            .reduce((sum, i) => sum + i.quantity, 0);
          
          if (bookedCount + Number(item.quantity) > ticket.capacity) {
            finalStatus = 'WAITLIST';
            break;
          }
        }
      }
    }

    const booking = await prisma.booking.create({
      data: {
        eventId,
        totalPrice: priceResult.finalPrice,
        status: finalStatus as any,
        customerDetails: customerDetails ?? undefined,
        paymentMethod: paymentMethod ?? undefined,
        remarks: remarks ?? undefined,
        items: items ? {
          create: items.map((i: any) => ({
            ticketId: i.ticketId,
            quantity: Number(i.quantity)
          }))
        } : undefined
      },
      include: { items: { include: { ticket: true } } }
    });

    // Send confirmation email asynchronously
    sendBookingConfirmationEmail(booking.id).catch(console.error);

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { items, id, user, event, ...bookingData } = req.body;
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id as string }, select: { status: true } });
    const booking = await prisma.booking.update({
      where: { id: req.params.id as string },
      data: {
        ...bookingData,
        items: items ? {
          deleteMany: {},
          create: items.map((i: any) => ({
            ticketId: i.ticketId,
            quantity: Number(i.quantity)
          }))
        } : undefined
      },
      include: { items: { include: { ticket: true } } }
    });
    if (bookingData.status === 'CANCELLED' && existing?.status !== 'CANCELLED') {
      sendCancellationEmail(booking.id, 'adminCancellation');
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Customer self-service: cancel their own booking
router.post('/:id/cancel', authenticateJWT, async (req: any, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id as string } });
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ message: 'Nicht erlaubt' });
    if (booking.status === 'CANCELLED') return res.status(400).json({ message: 'Diese Buchung ist bereits storniert' });

    const updated = await prisma.booking.update({
      where: { id: req.params.id as string },
      data: { status: 'CANCELLED' }
    });
    sendCancellationEmail(updated.id, 'userCancellation');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Customer self-service: update their own customer/contact details on a booking
router.put('/:id/my-details', authenticateJWT, async (req: any, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id as string } });
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ message: 'Nicht erlaubt' });
    if (booking.status === 'CANCELLED') return res.status(400).json({ message: 'Stornierte Buchungen können nicht bearbeitet werden' });

    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'street', 'zip', 'city', 'country'];
    const incoming = req.body || {};
    const currentDetails = (booking.customerDetails as any) || {};
    const newDetails = { ...currentDetails };
    for (const field of allowedFields) {
      if (incoming[field] !== undefined) newDetails[field] = incoming[field];
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id as string },
      data: { customerDetails: newDetails }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
