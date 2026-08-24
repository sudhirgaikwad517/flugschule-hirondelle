import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Allow public access to GET events for the frontend calendar
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { 
        tickets: {
          include: {
            items: {
              include: { booking: { select: { status: true } } }
            }
          }
        } 
      },
      orderBy: { startDate: 'asc' }
    });

    const parsedEvents = events.map(e => ({
      ...e,
      tickets: e.tickets.map((t: any) => {
        const bookedCount = t.items
          .filter((i: any) => i.booking.status !== 'CANCELLED')
          .reduce((acc: number, i: any) => acc + i.quantity, 0);
        const { items, ...ticketProps } = t;
        return { ...ticketProps, bookedCount };
      })
    }));

    res.set('Content-Range', `events 0-${parsedEvents.length}/${parsedEvents.length}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(parsedEvents);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ 
      where: { id: req.params.id as string },
      include: { 
        tickets: {
          include: {
            items: {
              include: { booking: { select: { status: true } } }
            }
          }
        } 
      }
    });
    if (!event) return res.status(404).json({ message: 'Not found' });
    
    const parsedEvent = {
      ...event,
      tickets: event.tickets.map((t: any) => {
        const bookedCount = t.items
          .filter((i: any) => i.booking.status !== 'CANCELLED')
          .reduce((acc: number, i: any) => acc + i.quantity, 0);
        const { items, ...ticketProps } = t;
        return { ...ticketProps, bookedCount };
      })
    };
    
    res.json(parsedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { tickets, ...eventData } = req.body;
    
    const data = { 
      ...eventData, 
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      capacity: Number(req.body.capacity)
    };
    
    const event = await prisma.event.create({ 
      data: {
        ...data,
        tickets: tickets ? {
          create: tickets.map((t: any) => ({
            name: t.name,
            price: Number(t.price),
            description: t.description,
            capacity: Number(t.capacity) || 0
          }))
        } : undefined
      },
      include: { tickets: true }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { tickets, id, ...eventData } = req.body;
    
    const data = { 
      ...eventData, 
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      capacity: Number(req.body.capacity)
    };

    // Update event and replace tickets (delete old, create new)
    const event = await prisma.event.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        tickets: tickets ? {
          deleteMany: {},
          create: tickets.map((t: any) => ({
            name: t.name,
            price: Number(t.price),
            description: t.description,
            capacity: Number(t.capacity) || 0
          }))
        } : undefined
      },
      include: { tickets: true }
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
