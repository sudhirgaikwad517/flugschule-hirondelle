import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { generateRecurringDates, RecurrenceSpec } from '../utils/recurrence';
import { buildIcsCalendar } from '../utils/ics';

const router = Router();

function buildTicketsCreate(tickets: any[] | undefined) {
  if (!tickets) return undefined;
  return {
    create: tickets.map((t: any) => ({
      name: t.name,
      price: Number(t.price),
      description: t.description,
      capacity: Number(t.capacity) || 0
    }))
  };
}

// Allow public access to GET events for the frontend calendar
router.get('/', async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q, categoryId, locationId, organizerId, published, cancelled } = req.query;

    let whereClause: any = {};
    if (q) {
      const qStr = String(q);
      const idMatch = qStr.match(/^id:(.+)$/i);
      if (idMatch) {
        whereClause.id = idMatch[1].trim();
      } else {
        whereClause.OR = [
          { title: { contains: qStr } },
          { shortDescription: { contains: qStr } },
          { description: { contains: qStr } },
          { location: { contains: qStr } },
          { leadSpeaker: { contains: qStr } },
          { targetGroup: { contains: qStr } },
          { eventNumber: { contains: qStr } }
        ];
      }
    }
    if (categoryId) whereClause.categoryId = categoryId;
    if (locationId) whereClause.locationId = locationId;
    if (organizerId) whereClause.organizerId = organizerId;
    if (published !== undefined) whereClause.published = published === 'true';
    if (cancelled !== undefined) whereClause.cancelled = cancelled === 'true';

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { startDate: 'asc' };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        include: { 
          categoryRef: true,
          tickets: {
            include: {
              items: {
                include: { booking: { select: { status: true } } }
              }
            }
          } 
        },
        skip,
        take,
        orderBy
      }),
      prisma.event.count({ where: whereClause })
    ]);

    const parsedEvents = events.map(e => ({
      ...e,
      tickets: ((e as any).tickets as any[]).map((t: any) => {
        const bookedCount = t.items
          .filter((i: any) => i.booking.status !== 'CANCELLED')
          .reduce((acc: number, i: any) => acc + i.quantity, 0);
        const { items, ...ticketProps } = t;
        return { ...ticketProps, bookedCount };
      })
    }));

    res.set('Content-Range', `events ${skip}-${skip + parsedEvents.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(parsedEvents);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Download ALL upcoming published events as one .ics file - matches
// Matukio's "Kalenderdatei herunterladen" list-page button. Registered
// before GET /:id since both are single-segment paths and Express would
// otherwise try to look up an event with id "ics".
router.get('/ics', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { published: true, cancelled: false, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' }
    });
    const ics = buildIcsCalendar(events, process.env.FRONTEND_URL || 'https://www.fs-hirondelle.de');
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="veranstaltungen.ics"');
    res.send(ics);
  } catch (error) {
    console.error('GET /ics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public RSS 2.0 feed of upcoming published events - matches Matukio's
// frontend RSS feed view. Same route-ordering rationale as /ics above.
router.get('/rss', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { published: true, cancelled: false, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 50
    });

    const siteUrl = process.env.FRONTEND_URL || 'https://www.fs-hirondelle.de';
    const escapeXml = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const items = events.map(e => `
    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${siteUrl}/buchungskalender/${e.id}</link>
      <guid isPermaLink="false">${e.id}</guid>
      <pubDate>${new Date(e.startDate).toUTCString()}</pubDate>
      <description>${escapeXml(e.shortDescription || e.description || '')}</description>
    </item>`).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Flugschule Hirondelle - Veranstaltungen</title>
    <link>${siteUrl}/buchungskalender</link>
    <description>Kommende Veranstaltungen der Flugschule Hirondelle</description>
    <language>de-de</language>${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(rss);
  } catch (error) {
    console.error('GET /rss error:', error);
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
      registrationDeadline: req.body.registrationDeadline ? new Date(req.body.registrationDeadline) : null,
      capacity: Number(req.body.capacity || 20),
      maxParticipants: req.body.maxParticipants ? Number(req.body.maxParticipants) : null,
      minParticipants: req.body.minParticipants ? Number(req.body.minParticipants) : null,
      maxBookablePerPerson: req.body.maxBookablePerPerson ? Number(req.body.maxBookablePerPerson) : null,
      feePerPerson: req.body.feePerPerson ? parseFloat(req.body.feePerPerson) : null,
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

// Explicit bulk publish/unpublish for the admin list's toolbar selection -
// PUT /:id requires a full event payload, so a partial-data bulk update
// through it would null out startDate/capacity/etc. This sets just the flag.
router.patch('/bulk-publish', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { ids, published } = req.body as { ids: string[]; published: boolean };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids ist erforderlich' });
    }
    await prisma.event.updateMany({
      where: { id: { in: ids } },
      data: { published: !!published }
    });
    res.json({ count: ids.length });
  } catch (error) {
    console.error('PATCH /bulk-publish error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { tickets, id, categoryRef, createdAt, updatedAt, ...eventData } = req.body;
    
    const data = { 
      ...eventData, 
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      registrationDeadline: req.body.registrationDeadline ? new Date(req.body.registrationDeadline) : null,
      capacity: Number(req.body.capacity || 20),
      maxParticipants: req.body.maxParticipants !== undefined ? Number(req.body.maxParticipants) : null,
      minParticipants: req.body.minParticipants !== undefined ? Number(req.body.minParticipants) : null,
      maxBookablePerPerson: req.body.maxBookablePerPerson !== undefined ? Number(req.body.maxBookablePerPerson) : null,
      feePerPerson: req.body.feePerPerson !== undefined ? parseFloat(req.body.feePerPerson) : null,
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

// List every date-occurrence belonging to the same series (i.e. "Termine" tab),
// with the same date-range filters Matukio's own date manager offered.
router.get('/series/:seriesId', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { seriesId } = req.params;
    const filter = String(req.query.filter || 'all');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 86400000);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

    const where: any = { seriesId };
    if (filter === 'current') where.startDate = { gte: now };
    else if (filter === 'past') where.startDate = { lt: now };
    else if (filter === 'today') where.startDate = { gte: startOfToday, lt: endOfToday };
    else if (filter === 'week') where.startDate = { gte: startOfWeek, lt: endOfWeek };
    else if (filter === 'month') where.startDate = { gte: startOfMonth, lt: endOfMonth };
    else if (filter === 'year') where.startDate = { gte: startOfYear, lt: endOfYear };
    else if (filter === 'cancelled') where.cancelled = true;

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: { bookings: { select: { id: true, status: true } } }
    });

    res.json(events.map(e => ({
      ...e,
      bookingsCount: e.bookings.filter(b => b.status !== 'CANCELLED').length,
      bookings: undefined
    })));
  } catch (error) {
    console.error('GET /series/:seriesId error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Batch-create a whole series of recurring dates from one shared template
// (Matukio's "Serientermine generieren" / batch date creation).
router.post('/recurring', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { template, tickets, recurrence, beginTime, endTime, bookingDeadlineTime, existingSeriesId } = req.body as {
      template: any; tickets: any[]; recurrence: RecurrenceSpec; beginTime: string; endTime: string; bookingDeadlineTime?: string; existingSeriesId?: string;
    };

    const dateStrings = generateRecurringDates(recurrence);
    if (dateStrings.length === 0) {
      return res.status(400).json({ message: 'Keine Termine mit diesen Angaben erzeugbar' });
    }

    const seriesId = existingSeriesId || crypto.randomUUID();
    const baseAlias = template.alias || template.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'termin';

    const created = [];
    for (const dateStr of dateStrings) {
      const startDate = new Date(`${dateStr}T${beginTime || '09:00'}:00`);
      const endDate = new Date(`${dateStr}T${endTime || '17:00'}:00`);
      const registrationDeadline = bookingDeadlineTime
        ? new Date(`${dateStr}T${bookingDeadlineTime}:00`)
        : null;

      const alias = `${baseAlias}-${dateStr}`;
      const existing = await prisma.event.findUnique({ where: { alias } });

      const event = await prisma.event.create({
        data: {
          ...template,
          alias: existing ? `${baseAlias}-${dateStr}-${crypto.randomBytes(2).toString('hex')}` : alias,
          startDate,
          endDate,
          registrationDeadline,
          capacity: Number(template.capacity) || 20,
          maxParticipants: template.maxParticipants ? Number(template.maxParticipants) : null,
          minParticipants: template.minParticipants ? Number(template.minParticipants) : null,
          feePerPerson: template.feePerPerson ? parseFloat(template.feePerPerson) : 0,
          seriesId,
          tickets: buildTicketsCreate(tickets)
        }
      });
      created.push(event);
    }

    res.status(201).json({ seriesId, count: created.length, events: created });
  } catch (error) {
    console.error('POST /recurring error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a single additional date to an existing series, copying every shared
// field from the reference event (Matukio's "+ Add Date" on an existing event).
router.post('/:id/add-date', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const reference = await prisma.event.findUnique({ where: { id: req.params.id as string } });
    if (!reference) return res.status(404).json({ message: 'Not found' });
    const referenceTickets = await prisma.eventTicket.findMany({ where: { eventId: reference.id } });

    const { startDate, endDate, registrationDeadline, titleOverride, capacityOverride, locationOverride } = req.body;
    if (!startDate) return res.status(400).json({ message: 'startDate ist erforderlich' });

    const seriesId = reference.seriesId || crypto.randomUUID();
    if (!reference.seriesId) {
      await prisma.event.update({ where: { id: reference.id }, data: { seriesId } });
    }

    const dateStr = new Date(startDate).toISOString().slice(0, 10);
    const baseAlias = reference.alias?.replace(/-\d{4}-\d{2}-\d{2}.*$/, '') || reference.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let alias = `${baseAlias}-${dateStr}`;
    if (await prisma.event.findUnique({ where: { alias } })) {
      alias = `${baseAlias}-${dateStr}-${crypto.randomBytes(2).toString('hex')}`;
    }

    const {
      id, createdAt, updatedAt, alias: _oldAlias, startDate: _s, endDate: _e, registrationDeadline: _r,
      ...shared
    } = reference as any;

    const event = await prisma.event.create({
      data: {
        ...shared,
        alias,
        title: titleOverride || reference.title,
        capacity: capacityOverride ? Number(capacityOverride) : reference.capacity,
        location: locationOverride || reference.location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        seriesId,
        cancelled: false,
        tickets: {
          create: referenceTickets.map(t => ({ name: t.name, price: t.price, description: t.description, capacity: t.capacity }))
        }
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('POST /:id/add-date error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Batch-add recurring dates to an EXISTING event's series in one call, reusing
// the same reference-copy logic as /add-date for every generated date
// (Matukio's "Serientermine generieren" invoked from an already-saved event).
router.post('/:id/add-recurring-dates', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const reference = await prisma.event.findUnique({ where: { id: req.params.id as string } });
    if (!reference) return res.status(404).json({ message: 'Not found' });
    const referenceTickets = await prisma.eventTicket.findMany({ where: { eventId: reference.id } });

    const { recurrence, beginTime, endTime, bookingDeadlineTime } = req.body as {
      recurrence: RecurrenceSpec; beginTime: string; endTime: string; bookingDeadlineTime?: string;
    };

    const dateStrings = generateRecurringDates(recurrence);
    if (dateStrings.length === 0) {
      return res.status(400).json({ message: 'Keine Termine mit diesen Angaben erzeugbar' });
    }

    const seriesId = reference.seriesId || crypto.randomUUID();
    if (!reference.seriesId) {
      await prisma.event.update({ where: { id: reference.id }, data: { seriesId } });
    }

    const baseAlias = reference.alias?.replace(/-\d{4}-\d{2}-\d{2}.*$/, '') || reference.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const {
      id, createdAt, updatedAt, alias: _oldAlias, startDate: _s, endDate: _e, registrationDeadline: _r,
      ...shared
    } = reference as any;

    const created = [];
    for (const dateStr of dateStrings) {
      const startDate = new Date(`${dateStr}T${beginTime || '09:00'}:00`);
      const endDate = new Date(`${dateStr}T${endTime || '17:00'}:00`);
      const registrationDeadline = bookingDeadlineTime ? new Date(`${dateStr}T${bookingDeadlineTime}:00`) : null;

      let alias = `${baseAlias}-${dateStr}`;
      if (await prisma.event.findUnique({ where: { alias } })) {
        alias = `${baseAlias}-${dateStr}-${crypto.randomBytes(2).toString('hex')}`;
      }

      const event = await prisma.event.create({
        data: {
          ...shared,
          alias,
          startDate,
          endDate,
          registrationDeadline,
          seriesId,
          cancelled: false,
          tickets: {
            create: referenceTickets.map(t => ({ name: t.name, price: t.price, description: t.description, capacity: t.capacity }))
          }
        }
      });
      created.push(event);
    }

    res.status(201).json({ seriesId, count: created.length, events: created });
  } catch (error) {
    console.error('POST /:id/add-recurring-dates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Quick standalone duplicate (Matukio has no direct equivalent, but this is the
// obvious complement so an admin never has to re-type an entire event by hand).
router.post('/:id/duplicate', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const reference = await prisma.event.findUnique({ where: { id: req.params.id as string } });
    if (!reference) return res.status(404).json({ message: 'Not found' });
    const referenceTickets = await prisma.eventTicket.findMany({ where: { eventId: reference.id } });

    const {
      id, createdAt, updatedAt, alias, startDate, endDate, registrationDeadline,
      seriesId,
      ...shared
    } = reference as any;

    const newAlias = `${alias || reference.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-kopie-${crypto.randomBytes(3).toString('hex')}`;

    const event = await prisma.event.create({
      data: {
        ...shared,
        title: `${reference.title} (Kopie)`,
        alias: newAlias,
        startDate: reference.startDate,
        endDate: reference.endDate,
        registrationDeadline: reference.registrationDeadline,
        seriesId: null,
        published: false,
        tickets: {
          create: referenceTickets.map(t => ({ name: t.name, price: t.price, description: t.description, capacity: t.capacity }))
        }
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('POST /:id/duplicate error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle a date's cancelled state (distinct from published - a cancelled date
// stays visible with a "Storniert" badge instead of disappearing entirely).
router.patch('/:id/toggle-cancel', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id as string } });
    if (!event) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.event.update({
      where: { id: req.params.id as string },
      data: { cancelled: !event.cancelled }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Lightweight publish/unpublish toggle for a single date row in the "Termine"
// list - PUT /:id requires a full event payload, so this avoids clobbering
// every other field with a partial body just to flip one flag.
router.patch('/:id/toggle-publish', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id as string } });
    if (!event) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.event.update({
      where: { id: req.params.id as string },
      data: { published: !event.published }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Single-event "Zum Kalender hinzufügen" download - the same standard .ics
// format works for Google Calendar, Outlook and Apple Calendar via import.
router.get('/:id/ics', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id as string } });
    if (!event) return res.status(404).json({ message: 'Not found' });

    const ics = buildIcsCalendar([event], process.env.FRONTEND_URL || 'https://www.fs-hirondelle.de');
    const filename = (event.alias || event.title).replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${filename}.ics"`);
    res.send(ics);
  } catch (error) {
    console.error('GET /:id/ics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
