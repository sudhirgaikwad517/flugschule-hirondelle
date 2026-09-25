import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public: used by the newsletter subscribe form to render extra fields
// (phone, interests, birthday, ...) - same definition/answer split as
// CustomField/Event.customFieldValues (see NewsletterFieldDefinition's own
// schema comment).
router.get('/public', async (req, res) => {
  try {
    const fields = await prisma.newsletterFieldDefinition.findMany({
      where: { showOnForm: true },
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
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { order: 'asc' };

    const [fields, total] = await Promise.all([
      prisma.newsletterFieldDefinition.findMany({ skip, take, orderBy }),
      prisma.newsletterFieldDefinition.count()
    ]);

    res.set('Content-Range', `newsletterFields ${skip}-${skip + fields.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const field = await prisma.newsletterFieldDefinition.findUnique({ where: { id: req.params.id as string } });
    if (!field) return res.status(404).json({ message: 'Not found' });
    res.json(field);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const field = await prisma.newsletterFieldDefinition.create({ data: req.body });
    res.status(201).json(field);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const field = await prisma.newsletterFieldDefinition.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    res.json(field);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.newsletterFieldDefinition.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
