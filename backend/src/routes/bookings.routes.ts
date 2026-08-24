import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({ 
      include: { 
        user: true, 
        event: true,
        items: { include: { ticket: true } }
      } 
    });
    res.set('Content-Range', `bookings 0-${bookings.length}/${bookings.length}`);
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

router.post('/', authenticateJWT, async (req: any, res) => {
  try {
    const { items, customerDetails, paymentMethod, remarks, eventId, ...bookingData } = req.body;
    
    // Check Event Deadline
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
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
        userId: req.user.id,
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
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public booking route for guests
router.post('/public', async (req, res) => {
  try {
    const { items, eventId, totalPrice, customerDetails, paymentMethod, remarks } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const booking = await prisma.booking.create({ 
      data: {
        eventId,
        totalPrice: totalPrice || 0,
        customerDetails: customerDetails || {},
        paymentMethod: paymentMethod,
        remarks: remarks,
        status: 'PENDING',
        items: items ? {
          create: items.map((i: any) => ({
            ticketId: i.ticketId,
            quantity: Number(i.quantity)
          }))
        } : undefined
      },
      include: { items: { include: { ticket: true } } }
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { items, id, user, event, ...bookingData } = req.body;
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
    res.json(booking);
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
