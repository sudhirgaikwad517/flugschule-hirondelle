import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { LEGAL_PAGE_DEFAULTS as DEFAULTS } from '../data/legalPageDefaults';

const router = Router();

async function getOrCreate(slug: string) {
  let page = await prisma.legalPage.findUnique({ where: { slug } });
  if (!page) {
    const fallback = DEFAULTS[slug] || { title: slug, content: '' };
    page = await prisma.legalPage.create({ data: { slug, ...fallback } });
  }
  return page;
}

// Public: fetch by slug (agb | widerruf)
router.get('/public/:slug', async (req, res) => {
  try {
    const page = await getOrCreate(req.params.slug as string);
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin list (react-admin data provider expects an array)
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    for (const slug of Object.keys(DEFAULTS)) {
      await getOrCreate(slug);
    }
    const pages = await prisma.legalPage.findMany({ orderBy: { slug: 'asc' } });
    res.set('Content-Range', `legalPages 0-${pages.length}/${pages.length}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const page = await prisma.legalPage.findUnique({ where: { id: req.params.id as string } });
    if (!page) return res.status(404).json({ message: 'Not found' });
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    const page = await prisma.legalPage.update({
      where: { id: req.params.id as string },
      data: { title, content }
    });
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
