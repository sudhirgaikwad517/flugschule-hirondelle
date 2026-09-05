import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';

const router = Router();

// Public organizer pages - list of published organizers, and one with their
// upcoming published events. Registered before the admin GET /:id since
// both are single-segment paths.
router.get('/public', async (req, res) => {
  try {
    const organizers = await prisma.organizer.findMany({
      where: { published: true },
      orderBy: { name: 'asc' }
    });
    res.json(organizers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const organizer = await prisma.organizer.findUnique({ where: { id: req.params.id as string, published: true } });
    if (!organizer) return res.status(404).json({ message: 'Not found' });

    const upcomingEvents = await prisma.event.findMany({
      where: { organizerId: organizer.id, published: true, cancelled: false, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 10
    });

    res.json({ ...organizer, upcomingEvents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Contact-organizer form - emails the organizer directly, matching Matukio's
// contactorganizer view. Uses the same admin-configurable SMTP as the
// newsletter system.
router.post('/:id/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, E-Mail und Nachricht sind erforderlich' });
    }

    const organizer = await prisma.organizer.findUnique({ where: { id: req.params.id as string } });
    if (!organizer || !organizer.email) {
      return res.status(404).json({ message: 'Veranstalter oder E-Mail-Adresse nicht gefunden' });
    }

    const { transporter, config } = await getNewsletterTransporter();
    await transporter.sendMail({
      from: config?.fromEmail || 'no-reply@fs-hirondelle.de',
      to: organizer.email,
      replyTo: email,
      subject: `Kontaktanfrage von ${name} über die Webseite`,
      text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>E-Mail:</strong> ${email}</p><p><strong>Nachricht:</strong></p><p>${String(message).replace(/\n/g, '<br>')}</p>`
    });

    res.json({ message: 'Nachricht erfolgreich gesendet' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Senden der Nachricht' });
  }
});

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q, ids } = req.query;

    let whereClause: any = {};
    if (ids) {
      whereClause.id = { in: String(ids).split(',') };
    } else if (q) {
      whereClause.name = { contains: String(q) };
    }

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const [organizers, total] = await Promise.all([
      prisma.organizer.findMany({
        where: whereClause,
        include: { user: { select: { id: true, name: true, email: true } } },
        skip,
        take,
        orderBy
      }),
      prisma.organizer.count({ where: whereClause })
    ]);

    res.set('Content-Range', `organizers ${skip}-${skip + organizers.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(organizers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const organizer = await prisma.organizer.findUnique({
      where: { id: req.params.id as string },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    if (!organizer) return res.status(404).json({ message: 'Not found' });
    res.json(organizer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { name, email, website, phone, imageUrl, description, comments, published, userId } = req.body;
    
    const organizer = await prisma.organizer.create({
      data: {
        name,
        email,
        website,
        phone,
        imageUrl,
        description,
        comments,
        published: published !== undefined ? published : true,
        userId: userId || null
      }
    });
    res.status(201).json(organizer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { name, email, website, phone, imageUrl, description, comments, published, userId } = req.body;
    
    const organizer = await prisma.organizer.update({
      where: { id: req.params.id as string },
      data: {
        name,
        email,
        website,
        phone,
        imageUrl,
        description,
        comments,
        published,
        userId: userId || null
      }
    });
    res.json(organizer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.organizer.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
