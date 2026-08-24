import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsletters = await prisma.newsletter.findMany();
    res.set('Content-Range', `newsletters 0-${newsletters.length}/${newsletters.length}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsletter = await prisma.newsletter.findUnique({ where: { id: req.params.id as string } });
    if (!newsletter) return res.status(404).json({ message: 'Not found' });
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsletter = await prisma.newsletter.create({ data: req.body });
    res.status(201).json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsletter = await prisma.newsletter.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.newsletter.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
