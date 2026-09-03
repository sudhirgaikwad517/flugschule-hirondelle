import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const lists = await prisma.newsletterList.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const enhancedLists = await Promise.all(lists.map(async list => {
      const subCount = list.code
        ? await prisma.newsletter.count({ where: { listType: list.code, isActive: true } })
        : 0;
      return { ...list, subscriberCount: subCount };
    }));

    res.set('Content-Range', `newsletterlists 0-${enhancedLists.length}/${enhancedLists.length}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(enhancedLists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Distinct active-subscriber count across one or more selected lists (dedupes by email)
router.get('/recipient-count', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const codes = String(req.query.codes || '').split(',').map(c => c.trim()).filter(Boolean);
    if (codes.length === 0) return res.json({ count: 0 });

    const subs = await prisma.newsletter.findMany({
      where: { listType: { in: codes }, isActive: true },
      select: { email: true },
      distinct: ['email']
    });
    res.json({ count: subs.length });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const list = await prisma.newsletterList.findUnique({ where: { id: (req.params.id as string) } });
    if (!list) return res.status(404).json({ message: 'Not found' });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const list = await prisma.newsletterList.create({ data: req.body });
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const list = await prisma.newsletterList.update({
      where: { id: (req.params.id as string) },
      data: req.body,
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.newsletterList.delete({ where: { id: (req.params.id as string) } });
    res.json({ id: (req.params.id as string) });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
