import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { resolveSegmentRecipients } from '../services/newsletterSegments.service';

const router = Router();

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const [segments, total] = await Promise.all([
      prisma.newsletterSegment.findMany({ skip, take, orderBy }),
      prisma.newsletterSegment.count(),
    ]);

    res.set('Content-Range', `newsletterSegments ${skip}-${skip + segments.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(segments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const segment = await prisma.newsletterSegment.findUnique({ where: { id: req.params.id as string } });
    if (!segment) return res.status(404).json({ message: 'Not found' });
    res.json(segment);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Live member count - lets the admin see how big a segment actually is
// while editing its conditions, before saving/using it on a campaign.
router.get('/:id/preview-count', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const recipients = await resolveSegmentRecipients(req.params.id as string);
    res.json({ count: recipients.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { name, matchType, conditions } = req.body;
    const segment = await prisma.newsletterSegment.create({
      data: {
        name,
        matchType: matchType || 'all',
        conditions: typeof conditions === 'string' ? conditions : JSON.stringify(conditions || []),
      },
    });
    res.status(201).json(segment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { name, matchType, conditions } = req.body;
    const segment = await prisma.newsletterSegment.update({
      where: { id: req.params.id as string },
      data: {
        name,
        matchType,
        conditions: typeof conditions === 'string' ? conditions : JSON.stringify(conditions || []),
      },
    });
    res.json(segment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.newsletterSegment.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
