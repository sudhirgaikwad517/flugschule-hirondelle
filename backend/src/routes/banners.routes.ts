import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// GET active banners for public (by position)
router.get('/public', async (req, res) => {
  try {
    const banners = await prisma.adBanner.findMany({
      where: { published: true },
      orderBy: { order: 'asc' }
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for AdBanners
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [_sort as string]: _order ? (_order as string).toLowerCase() : 'asc' } : { order: 'asc' };

    const [banners, total] = await Promise.all([
      prisma.adBanner.findMany({ skip, take, orderBy }),
      prisma.adBanner.count()
    ]);
    res.set('Content-Range', `banners ${skip}-${skip + banners.length}/${total}`);
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const banner = await prisma.adBanner.findUnique({ where: { id: req.params.id as string } });
    if (!banner) return res.status(404).json({ message: 'Not found' });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const banner = await prisma.adBanner.create({ data: req.body });
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const banner = await prisma.adBanner.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.adBanner.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
