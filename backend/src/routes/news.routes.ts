import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// GET all news (Public)
router.get('/public', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET single news by slug (Public)
router.get('/public/:slug', async (req, res) => {
  try {
    const newsItem = await prisma.news.findUnique({
      where: { slug: req.params.slug }
    });
    if (!newsItem || !newsItem.published) return res.status(404).json({ message: 'Not found' });
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET all news (Admin)
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [_sort as string]: _order ? (_order as string).toLowerCase() : 'desc' } : { createdAt: 'desc' };

    const [news, total] = await Promise.all([
      prisma.news.findMany({ skip, take, orderBy }),
      prisma.news.count()
    ]);

    res.set('Content-Range', `news ${skip}-${skip + news.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET single news (Admin)
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsItem = await prisma.news.findUnique({ where: { id: (req.params.id as string) } });
    if (!newsItem) return res.status(404).json({ message: 'Not found' });
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST new news (Admin)
router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = req.body;
    
    // Auto generate slug if not provided
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const newsItem = await prisma.news.create({ data });
    res.status(201).json(newsItem);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Slug must be unique' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update news (Admin)
router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsItem = await prisma.news.update({
      where: { id: (req.params.id as string) },
      data: req.body
    });
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE news (Admin)
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.news.delete({ where: { id: (req.params.id as string) } });
    res.json({ id: (req.params.id as string) });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
