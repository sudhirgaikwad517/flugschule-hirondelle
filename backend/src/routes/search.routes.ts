import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

// GET global search results
router.get('/public', async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      return res.json({ events: [], news: [], downloads: [] });
    }

    const searchQuery = { contains: q, mode: 'insensitive' as const };

    const [events, news, downloads] = await Promise.all([
      prisma.event.findMany({
        where: {
          OR: [
            { title: searchQuery },
            { description: searchQuery },
            { shortDescription: searchQuery },
          ],
          published: true,
        },
        take: 10,
        orderBy: { startDate: 'asc' }
      }),
      prisma.news.findMany({
        where: {
          OR: [
            { title: searchQuery },
            { content: searchQuery },
          ],
          published: true,
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.downloadFile.findMany({
        where: {
          OR: [
            { title: searchQuery },
            { description: searchQuery },
          ],
          published: true,
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      events,
      news,
      downloads
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
