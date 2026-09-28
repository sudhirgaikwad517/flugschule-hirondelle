import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { processAutomationRuns } from '../services/newsletterAutomation.service';

const router = Router();

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const [automations, total] = await Promise.all([
      prisma.newsletterAutomation.findMany({ skip, take, orderBy }),
      prisma.newsletterAutomation.count(),
    ]);

    const withRunCounts = await Promise.all(automations.map(async (a) => {
      const [activeRuns, completedRuns] = await Promise.all([
        prisma.newsletterAutomationRun.count({ where: { automationId: a.id, completedAt: null } }),
        prisma.newsletterAutomationRun.count({ where: { automationId: a.id, completedAt: { not: null } } }),
      ]);
      return { ...a, activeRuns, completedRuns };
    }));

    res.set('Content-Range', `newsletterAutomations ${skip}-${skip + automations.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(withRunCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const automation = await prisma.newsletterAutomation.findUnique({ where: { id: req.params.id as string } });
    if (!automation) return res.status(404).json({ message: 'Not found' });
    res.json(automation);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/process-now', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const result = await processAutomationRuns();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { name, active, triggerListCode, steps } = req.body;
    const automation = await prisma.newsletterAutomation.create({
      data: {
        name,
        active: active ?? true,
        triggerListCode: triggerListCode || null,
        steps: typeof steps === 'string' ? steps : JSON.stringify(steps || []),
      },
    });
    res.status(201).json(automation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { name, active, triggerListCode, steps } = req.body;
    const automation = await prisma.newsletterAutomation.update({
      where: { id: req.params.id as string },
      data: {
        name,
        active,
        triggerListCode: triggerListCode || null,
        steps: typeof steps === 'string' ? steps : JSON.stringify(steps || []),
      },
    });
    res.json(automation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.newsletterAutomation.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
