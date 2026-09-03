import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q } = req.query;

    let whereClause: any = {};
    if (q) {
      whereClause.title = { contains: String(q), mode: 'insensitive' };
    }

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { title: 'asc' };

    const [tieredFees, total] = await Promise.all([
      prisma.tieredFee.findMany({
        where: whereClause,
        skip,
        take,
        orderBy
      }),
      prisma.tieredFee.count({ where: whereClause })
    ]);

    res.set('Content-Range', `tieredFees ${skip}-${skip + tieredFees.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(tieredFees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const tieredFee = await prisma.tieredFee.findUnique({
      where: { id: req.params.id as string }
    });
    if (!tieredFee) return res.status(404).json({ message: 'Not found' });
    res.json(tieredFee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.validFrom) data.validFrom = new Date(data.validFrom);
    if (data.validUntil) data.validUntil = new Date(data.validUntil);
    if (data.value) data.value = Number(data.value);

    const tieredFee = await prisma.tieredFee.create({
      data
    });
    res.status(201).json(tieredFee);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.validFrom) data.validFrom = new Date(data.validFrom);
    if (data.validUntil) data.validUntil = new Date(data.validUntil);
    if (data.value) data.value = Number(data.value);

    const tieredFee = await prisma.tieredFee.update({
      where: { id: req.params.id as string },
      data
    });
    res.json(tieredFee);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.tieredFee.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
