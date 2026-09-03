import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint for frontend booking form
router.get('/public', async (req, res) => {
  try {
    const fields = await prisma.customField.findMany({
      where: { published: true },
      orderBy: { order: 'asc' }
    });
    res.json(fields);
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
      whereClause.title = { contains: String(q), mode: 'insensitive' };
    }

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { order: 'asc' };

    const [customFields, total] = await Promise.all([
      prisma.customField.findMany({
        where: whereClause,
        skip,
        take,
        orderBy
      }),
      prisma.customField.count({ where: whereClause })
    ]);

    res.set('Content-Range', `customFields ${skip}-${skip + customFields.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(customFields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const customField = await prisma.customField.findUnique({
      where: { id: req.params.id as string }
    });
    if (!customField) return res.status(404).json({ message: 'Not found' });
    res.json(customField);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const customField = await prisma.customField.create({
      data: req.body
    });
    res.status(201).json(customField);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const customField = await prisma.customField.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    res.json(customField);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.customField.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
