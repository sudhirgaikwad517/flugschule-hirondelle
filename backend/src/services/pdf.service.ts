import PDFDocument from 'pdfkit';
import { prisma } from '../utils/prisma';
import fs from 'fs';
import path from 'path';
import { resolveBookingCustomer } from '../utils/bookingCustomer';

const uploadsDir = path.join(__dirname, '../../uploads');

export async function generateInvoicePDF(bookingId: string): Promise<Buffer> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      event: true,
      items: { include: { ticket: true } },
      user: true,
    }
  });

  if (!booking) throw new Error('Booking not found');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Document styling
    doc.fontSize(20).text('Rechnung', { align: 'right' });
    doc.moveDown();

    // Company Details
    doc.fontSize(10)
      .text('Flugschule Hirondelle', 50, 50)
      .text('Musterstraße 123', 50, 65)
      .text('12345 Musterstadt', 50, 80)
      .text('Deutschland', 50, 95);

    doc.moveDown(3);

    // Customer Details
    const customer = booking.customerDetails as any;
    if (customer) {
      doc.text(`${customer.salutation} ${customer.firstName || ''} ${customer.lastName || customer.fullName || ''}`);
      doc.text(customer.street || '');
      doc.text(`${customer.zip || ''} ${customer.city || ''}`);
    }

    doc.moveDown(2);

    doc.fontSize(12).text(`Rechnungsnummer: RE-${booking.id.split('-')[0].toUpperCase()}`, { align: 'right' });
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { align: 'right' });
    
    doc.moveDown(2);

    // Invoice Table Header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Beschreibung', 50, doc.y);
    doc.text('Menge', 300, doc.y);
    doc.text('Einzelpreis', 400, doc.y);
    doc.text('Gesamt', 500, doc.y);
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown();

    // Invoice Items
    doc.font('Helvetica');
    let y = doc.y + 10;
    
    booking.items.forEach(item => {
      doc.text(item.ticket.name, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`${item.ticket.price.toFixed(2)} €`, 400, y);
      doc.text(`${(item.ticket.price * item.quantity).toFixed(2)} €`, 500, y);
      y += 20;
    });

    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
    
    y += 20;
    doc.font('Helvetica-Bold');
    doc.text('Gesamtbetrag:', 350, y);
    doc.text(`${booking.totalPrice.toFixed(2)} €`, 500, y);

    // Save to filesystem for later download
    const invoicesDir = path.join(uploadsDir, 'invoices');
    if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });
    
    // We can also pipe to file while collecting buffers
    // doc.pipe(fs.createWriteStream(path.join(invoicesDir, `RE-${booking.id}.pdf`)));
    // But since we want to return the buffer for the email attachment, we just end it.

    doc.end();
  });
}

export async function generateTicketPDF(bookingId: string): Promise<Buffer> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      event: true,
      items: { include: { ticket: true } },
    }
  });

  if (!booking) throw new Error('Booking not found');

  let locationName = booking.event.location || 'TBA';
  if (!booking.event.location && booking.event.locationId) {
    const loc = await prisma.location.findUnique({ where: { id: booking.event.locationId } });
    if (loc) locationName = loc.title;
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, layout: 'landscape', size: 'A5' });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Branding
    doc.rect(0, 0, doc.page.width, 40).fill('#ab8942');
    doc.fillColor('white').fontSize(16).text('Flugschule Hirondelle - Ticket', 20, 12);

    doc.fillColor('black');
    doc.moveDown(3);

    // Event Info
    doc.fontSize(18).font('Helvetica-Bold').text(booking.event.title);
    doc.fontSize(12).font('Helvetica')
       .text(`Datum: ${new Date(booking.event.startDate).toLocaleDateString('de-DE')}${booking.event.endDate ? ` - ${new Date(booking.event.endDate).toLocaleDateString('de-DE')}` : ''}`)
       .text(`Ort: ${locationName}`);
    
    doc.moveDown();

    // Customer
    const customer = booking.customerDetails as any;
    if (customer) {
      doc.text(`Teilnehmer: ${customer.salutation} ${customer.firstName || ''} ${customer.lastName || customer.fullName || ''}`);
    }

    doc.moveDown();
    
    // Items
    booking.items.forEach(item => {
       doc.text(`- ${item.quantity}x ${item.ticket.name}`);
    });

    // Barcode Placeholder
    doc.rect(400, 100, 100, 100).stroke();
    doc.fontSize(8).text('Scan Me', 430, 145);

    doc.end();
  });
}

// Matukio's "Name tag (PDF)" - one small badge per booking, printed/cut out
// for the participant to wear at the event.
export async function generateNameTagPDF(bookingId: string): Promise<Buffer> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true, user: true },
  });

  if (!booking) throw new Error('Booking not found');
  const { name } = resolveBookingCustomer(booking);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: [283, 170] }); // ~ 100mm x 60mm badge
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 40).fill('#ab8942');
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold').text('Flugschule Hirondelle', 15, 14);

    doc.fillColor('black');
    doc.fontSize(20).font('Helvetica-Bold').text(name, 15, 60, { width: 253, align: 'center' });

    doc.fontSize(11).font('Helvetica').text(booking.event.title, 15, 100, { width: 253, align: 'center' });
    doc.fontSize(9).fillColor('#666').text(
      new Date(booking.event.startDate).toLocaleDateString('de-DE'),
      15, 125, { width: 253, align: 'center' }
    );

    doc.end();
  });
}
