import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin, AuthRequest } from '../middlewares/auth.middleware';
import { sendBookingConfirmationEmail, sendCancellationEmail } from '../services/mailer.service';
import { calculateBookingPrice } from '../utils/bookingPrice';
import { JWT_SECRET } from '../utils/config';
import jwt from 'jsonwebtoken';

const router = Router();

import { generateInvoicePDF, generateTicketPDF } from '../services/pdf.service';

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

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, status, eventId } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (eventId) whereClause.eventId = eventId;

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
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
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
