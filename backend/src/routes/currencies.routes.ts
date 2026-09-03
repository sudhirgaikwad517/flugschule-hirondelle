import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q } = req.query;

    let whereClause: any = {};
    if (q) {
      whereClause.description = { contains: String(q), mode: 'insensitive' };
    }

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { description: 'asc' };

    const [currencies, total] = await Promise.all([
      prisma.currency.findMany({
        where: whereClause,
        skip,
        take,
        orderBy
      }),
      prisma.currency.count({ where: whereClause })
    ]);

    res.set('Content-Range', `currencies ${skip}-${skip + currencies.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(currencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const currency = await prisma.currency.findUnique({
      where: { id: req.params.id as string }
    });
    if (!currency) return res.status(404).json({ message: 'Not found' });
    res.json(currency);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const currency = await prisma.currency.create({
      data: req.body
    });
    res.status(201).json(currency);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const currency = await prisma.currency.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    res.json(currency);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.currency.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
