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

    const [taxRates, total] = await Promise.all([
      prisma.taxRate.findMany({
        where: whereClause,
        skip,
        take,
        orderBy
      }),
      prisma.taxRate.count({ where: whereClause })
    ]);

    res.set('Content-Range', `taxRates ${skip}-${skip + taxRates.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(taxRates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const taxRate = await prisma.taxRate.findUnique({
      where: { id: req.params.id as string }
    });
    if (!taxRate) return res.status(404).json({ message: 'Not found' });
    res.json(taxRate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.value) data.value = Number(data.value);

    const taxRate = await prisma.taxRate.create({
      data
    });
    res.status(201).json(taxRate);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.value) data.value = Number(data.value);

    const taxRate = await prisma.taxRate.update({
      where: { id: req.params.id as string },
      data
    });
    res.json(taxRate);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.taxRate.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
