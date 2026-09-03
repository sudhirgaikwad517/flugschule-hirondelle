import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Add Content-Range header for React Admin
router.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Content-Range');
  next();
});

// Helper to parse galleryImages
const parseGalleryImages = (media: any) => {
  if (media && media.galleryImages) {
    try {
      media.galleryImages = JSON.parse(media.galleryImages);
    } catch (e) {
      media.galleryImages = [];
    }
  }
  return media;
};

// Admin: Get all PageMedia
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;

    const skip = _start ? parseInt(_start as string) : 0;
    const take = _end ? parseInt(_end as string) - skip : 50;
    const orderBy: any = _sort ? { [_sort as string]: _order === 'DESC' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const totalCount = await prisma.pageMedia.count();
    let media = await prisma.pageMedia.findMany({
      skip,
      take,
      orderBy,
    });

    media = media.map(parseGalleryImages);

    res.set('Content-Range', `pagemedia ${skip}-${skip + media.length}/${totalCount}`);
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Page Media' });
  }
});

// Public: Get PageMedia by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let media = await prisma.pageMedia.findUnique({
      where: { slug }
    });
    if (!media) {
      return res.status(404).json({ error: 'Page Media not found' });
    }
    res.json(parseGalleryImages(media));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Page Media' });
  }
});

// Admin: Get PageMedia by ID
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    let media = await prisma.pageMedia.findUnique({
      where: { id: (req.params.id as string) }
    });
    if (media) {
      res.json(parseGalleryImages(media));
    } else {
      res.status(404).json({ error: 'Page Media not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Page Media' });
  }
});

// Admin: Create PageMedia
router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = req.body;
    if (data.galleryImages) {
      data.galleryImages = JSON.stringify(data.galleryImages);
    }
    const media = await prisma.pageMedia.create({ data });
    res.status(201).json(parseGalleryImages(media));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Page Media' });
  }
});

// Admin: Update PageMedia
router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = req.body;
    // Don't update ID
    delete data.id;

    if (data.galleryImages) {
      data.galleryImages = JSON.stringify(data.galleryImages);
    }

    const media = await prisma.pageMedia.update({
      where: { id: (req.params.id as string) },
      data
    });
    res.json(parseGalleryImages(media));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Page Media' });
  }
});

// Admin: Delete PageMedia
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.pageMedia.delete({
      where: { id: (req.params.id as string) }
    });
    res.json({ message: 'Page Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Page Media' });
  }
});

export default router;
