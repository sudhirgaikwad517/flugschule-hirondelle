import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// GET all categories with links (Public)
router.get('/weblinks/public', async (req, res) => {
  try {
    const categories = await prisma.webLinkCategory.findMany({
      where: { published: true },
      include: {
        links: {
          where: { published: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for WebLinkCategories
router.get('/weblinkcategories', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [_sort as string]: _order ? (_order as string).toLowerCase() : 'asc' } : { order: 'asc' };

    const [categories, total] = await Promise.all([
      prisma.webLinkCategory.findMany({ skip, take, orderBy }),
      prisma.webLinkCategory.count()
    ]);
    res.set('Content-Range', `weblinkcategories ${skip}-${skip + categories.length}/${total}`);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/weblinkcategories/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const category = await prisma.webLinkCategory.findUnique({ where: { id: (req.params.id as string) } });
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/weblinkcategories', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const category = await prisma.webLinkCategory.create({ data: req.body });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/weblinkcategories/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const category = await prisma.webLinkCategory.update({
      where: { id: (req.params.id as string) },
      data: req.body
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/weblinkcategories/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.webLinkCategory.delete({ where: { id: (req.params.id as string) } });
    res.json({ id: (req.params.id as string) });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for WebLinks
router.get('/links', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [_sort as string]: _order ? (_order as string).toLowerCase() : 'asc' } : { order: 'asc' };

    const [links, total] = await Promise.all([
      prisma.webLink.findMany({ skip, take, orderBy }),
      prisma.webLink.count()
    ]);
    res.set('Content-Range', `links ${skip}-${skip + links.length}/${total}`);
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/links/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const link = await prisma.webLink.findUnique({ where: { id: (req.params.id as string) } });
    if (!link) return res.status(404).json({ message: 'Not found' });
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/links', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const link = await prisma.webLink.create({ data: req.body });
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/links/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const link = await prisma.webLink.update({
      where: { id: (req.params.id as string) },
      data: req.body
    });
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/links/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.webLink.delete({ where: { id: (req.params.id as string) } });
    res.json({ id: (req.params.id as string) });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
