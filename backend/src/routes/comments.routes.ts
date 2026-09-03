import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// GET all comments (for Admin)
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, eventId } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [_sort as string]: _order ? (_order as string).toLowerCase() : 'desc' } : { createdAt: 'desc' };
    
    const where: any = {};
    if (eventId) where.eventId = eventId;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where, skip, take, orderBy,
        include: { Event: { select: { title: true } }, user: { select: { name: true } } }
      }),
      prisma.comment.count({ where })
    ]);

    // Format for React Admin
    const formattedComments = comments.map((c: any) => ({
      ...c,
      authorName: c.user?.name || c.name || 'Anonym',
      eventTitle: c.Event?.title || c.pageSlug || 'Unbekannt'
    }));

    res.set('Content-Range', `comments ${skip}-${skip + formattedComments.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(formattedComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET public comments for an event or pageSlug
router.get('/public', async (req, res) => {
  try {
    const { eventId, pageSlug } = req.query;
    
    const whereClause: any = {
      isApproved: true,
      parentId: null
    };

    if (eventId) {
      whereClause.eventId = eventId as string;
    } else if (pageSlug) {
      whereClause.pageSlug = pageSlug as string;
    } else {
      return res.status(400).json({ message: 'eventId oder pageSlug erforderlich' });
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true } },
        other_Comment: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatComment = (c: any) => ({
      id: c.id,
      content: c.content,
      authorName: c.user?.name || c.name || 'Anonym',
      createdAt: c.createdAt,
      replies: c.other_Comment ? c.other_Comment.map(formatComment) : []
    });

    res.json(comments.map(formatComment));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET single comment
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: (req.params.id as string) },
      include: { Event: { select: { title: true } }, user: { select: { name: true } } }
    });
    if (!comment) return res.status(404).json({ message: 'Not found' });
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST new comment (Public / Logged in User)
router.post('/public', async (req, res) => {
  try {
    const { eventId, pageSlug, content, name, email, parentId } = req.body;
    
    // In a real scenario, we'd extract userId from a soft auth check
    // For now, we allow guest comments
    
    if ((!eventId && !pageSlug) || !content) {
      return res.status(400).json({ message: 'Event ID/Page Slug und Inhalt sind erforderlich' });
    }

    const comment = await prisma.comment.create({
      data: {
        eventId: eventId || undefined,
        pageSlug: pageSlug || undefined,
        content,
        name: name || undefined,
        email: email || undefined,
        parentId: parentId || undefined,
        isApproved: false // Requires admin moderation
      }
    });

    res.status(201).json({ message: 'Kommentar erfolgreich gesendet und wartet auf Freigabe', comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Erstellen des Kommentars' });
  }
});

// Admin Reply
router.post('/:id/reply', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { content } = req.body;
    const parentComment = await prisma.comment.findUnique({ where: { id: (req.params.id as string) } });
    if (!parentComment) return res.status(404).json({ message: 'Not found' });

    const reply = await prisma.comment.create({
      data: {
        eventId: parentComment.eventId,
        content,
        userId: (req as any).user.id, // Admin's user ID
        parentId: parentComment.id,
        isApproved: true
      }
    });

    res.status(201).json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT Update comment (Admin)
router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { isApproved, content } = req.body;
    const comment = await prisma.comment.update({
      where: { id: (req.params.id as string) },
      data: { isApproved, content }
    });
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE comment
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.comment.delete({ where: { id: (req.params.id as string) } });
    res.json({ id: (req.params.id as string) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
