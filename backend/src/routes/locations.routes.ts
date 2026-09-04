import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public location detail page - list of published locations, and one with
// its upcoming published events. Registered before the admin GET /:id since
// both are single-segment paths.
router.get('/public', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { published: true },
      orderBy: { title: 'asc' }
    });
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const location = await prisma.location.findUnique({ where: { id: req.params.id as string, published: true } });
    if (!location) return res.status(404).json({ message: 'Not found' });

    const upcomingEvents = await prisma.event.findMany({
      where: { locationId: location.id, published: true, cancelled: false, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 10
    });

    res.json({ ...location, upcomingEvents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q } = req.query;

    let whereClause: any = {};
    if (q) {
      whereClause.OR = [
        { title: { contains: String(q) } },
        { name: { contains: String(q) } }
      ];
    }

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { title: 'asc' };

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where: whereClause,
        skip,
        take,
        orderBy
      }),
      prisma.location.count({ where: whereClause })
    ]);

    res.set('Content-Range', `locations ${skip}-${skip + locations.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id as string }
    });
    if (!location) return res.status(404).json({ message: 'Not found' });
    res.json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const location = await prisma.location.create({
      data: req.body
    });
    res.status(201).json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const location = await prisma.location.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    res.json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
