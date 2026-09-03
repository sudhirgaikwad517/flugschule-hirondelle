import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Add Content-Range header for React Admin
router.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Content-Range');
  next();
});

// Get all templates
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;

    const skip = _start ? parseInt(_start as string) : 0;
    const take = _end ? parseInt(_end as string) - skip : 50;
    const orderBy: any = _sort ? { [_sort as string]: _order === 'DESC' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const totalCount = await prisma.newsletterTemplate.count();
    const templates = await prisma.newsletterTemplate.findMany({
      skip,
      take,
      orderBy,
    });

    res.set('Content-Range', `newslettertemplates ${skip}-${skip + templates.length}/${totalCount}`);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Newsletter Templates' });
  }
});

// Get single template
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const template = await prisma.newsletterTemplate.findUnique({
      where: { id: (req.params.id as string) }
    });
    if (template) {
      res.json(template);
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Template' });
  }
});

// Create template
router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = req.body;
    const template = await prisma.newsletterTemplate.create({ data });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Template' });
  }
});

// Update template
router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = req.body;
    delete data.id;

    const template = await prisma.newsletterTemplate.update({
      where: { id: (req.params.id as string) },
      data
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Template' });
  }
});

// Delete template
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.newsletterTemplate.delete({
      where: { id: (req.params.id as string) }
    });
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Template' });
  }
});

export default router;
