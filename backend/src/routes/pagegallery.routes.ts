import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

// NEW FILE - standalone "Galerie" feature, separate from pagemedia.routes.ts
// on purpose (see the PageGallery model comment in schema.prisma). Only
// handles a slug + a list of image URLs, nothing else. To revert: delete
// this file, remove its mount in index.ts, and drop the PageGallery model.

const router = Router();

// Add Content-Range header for React Admin
router.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Content-Range');
  next();
});

// Helper to parse the stored `images` JSON string into an array
const parseImages = (gallery: any) => {
  if (gallery && gallery.images) {
    try {
      gallery.images = JSON.parse(gallery.images);
    } catch (e) {
      gallery.images = [];
    }
  }
  return gallery;
};

// Admin: Get all PageGallery rows
// Supports a `q` search filter (matches Categories.tsx / categories.routes.ts's
// existing search pattern) so the admin's "Galerie" list can be searched by
// page slug - see the `q` TextInput filter in frontend/src/admin/Gallery.tsx.
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q } = req.query;

    const skip = _start ? parseInt(_start as string) : 0;
    const take = _end ? parseInt(_end as string) - skip : 50;
    const orderBy: any = _sort ? { [_sort as string]: _order === 'DESC' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const whereClause: any = q ? { slug: { contains: String(q) } } : {};

    const totalCount = await prisma.pageGallery.count({ where: whereClause });
    let galleries = await prisma.pageGallery.findMany({
      where: whereClause,
      skip,
      take,
      orderBy,
    });

    galleries = galleries.map(parseImages);

    res.set('Content-Range', `pagegallery ${skip}-${skip + galleries.length}/${totalCount}`);
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Page Gallery' });
  }
});

// Public: Get PageGallery by slug - used by frontend/src/hooks/usePageGallery.ts
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let gallery = await prisma.pageGallery.findUnique({
      where: { slug }
    });
    if (!gallery) {
      return res.status(404).json({ error: 'Page Gallery not found' });
    }
    res.json(parseImages(gallery));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Page Gallery' });
  }
});

// Admin: Get PageGallery by ID
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    let gallery = await prisma.pageGallery.findUnique({
      where: { id: (req.params.id as string) }
    });
    if (gallery) {
      res.json(parseImages(gallery));
    } else {
      res.status(404).json({ error: 'Page Gallery not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Page Gallery' });
  }
});

// Admin: Create PageGallery
router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = req.body;
    if (data.images) {
      data.images = JSON.stringify(data.images);
    }
    const gallery = await prisma.pageGallery.create({ data });
    res.status(201).json(parseImages(gallery));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Page Gallery' });
  }
});

// Admin: Update PageGallery
router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = req.body;
    delete data.id;

    if (data.images) {
      data.images = JSON.stringify(data.images);
    }

    const gallery = await prisma.pageGallery.update({
      where: { id: (req.params.id as string) },
      data
    });
    res.json(parseImages(gallery));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Page Gallery' });
  }
});

// Admin: Delete PageGallery
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.pageGallery.delete({
      where: { id: (req.params.id as string) }
    });
    res.json({ message: 'Page Gallery deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Page Gallery' });
  }
});

export default router;
