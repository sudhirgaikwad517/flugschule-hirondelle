import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { processNewsletterQueue } from '../services/newsletterQueueProcessor';

const router = Router();

// Get all queue items
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const items = await prisma.newsletterQueue.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200 // limit to 200 for UI performance
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Clear queue
router.post('/clear', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.newsletterQueue.deleteMany();
    res.json({ message: 'Queue cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Process manually - shares the exact same logic as the every-minute cron job
// (real SMTP, tag personalization, Konfiguration > Warteschlange rate limits)
router.post('/process', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { processed } = await processNewsletterQueue();
    res.json({ message: processed === 0 ? 'No pending items' : `Processed ${processed} items` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
