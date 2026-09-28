import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { checkBounces } from '../services/bounceChecker.service';

const router = Router();

// List of subscribers currently suppressed by bounce detection.
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { bouncedAt: 'desc' };

    const where = { bounced: true };
    const [bounces, total] = await Promise.all([
      prisma.newsletter.findMany({ where, skip, take, orderBy }),
      prisma.newsletter.count({ where }),
    ]);

    res.set('Content-Range', `newsletterBounces ${skip}-${skip + bounces.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(bounces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Manual "Jetzt prüfen" trigger, in addition to the every-30-minutes cron.
router.post('/check-now', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const result = await checkBounces();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Un-suppress a subscriber the admin has confirmed is a false positive (or
// whose mailbox is working again) - clears the bounce flag and reactivates.
router.post('/:id/reactivate', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const sub = await prisma.newsletter.update({
      where: { id: req.params.id as string },
      data: { isActive: true, bounced: false, bounceReason: null, bouncedAt: null },
    });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
