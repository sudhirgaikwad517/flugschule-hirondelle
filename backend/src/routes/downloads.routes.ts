import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// GET all categories with files (Public)
router.get('/downloads/public', async (req, res) => {
  try {
    const categories = await prisma.downloadCategory.findMany({
      where: { published: true },
      include: {
        DownloadFile: {
          where: { published: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
    const withFiles = categories.map(({ DownloadFile, ...c }) => ({ ...c, files: DownloadFile }));
    res.json(withFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for DownloadCategories
router.get('/downloadcategories', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [_sort as string]: _order ? (_order as string).toLowerCase() : 'asc' } : { order: 'asc' };

    const [categories, total] = await Promise.all([
      prisma.downloadCategory.findMany({ skip, take, orderBy }),
      prisma.downloadCategory.count()
    ]);
    res.set('Content-Range', `downloadcategories ${skip}-${skip + categories.length}/${total}`);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/downloadcategories/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const category = await prisma.downloadCategory.findUnique({ where: { id: (req.params.id as string) } });
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/downloadcategories', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const category = await prisma.downloadCategory.create({ data: req.body });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/downloadcategories/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const category = await prisma.downloadCategory.update({
      where: { id: (req.params.id as string) },
      data: req.body
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/downloadcategories/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.downloadCategory.delete({ where: { id: (req.params.id as string) } });
    res.json({ id: (req.params.id as string) });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for DownloadFiles
router.get('/files', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [_sort as string]: _order ? (_order as string).toLowerCase() : 'asc' } : { order: 'asc' };

    const [files, total] = await Promise.all([
      prisma.downloadFile.findMany({ skip, take, orderBy }),
      prisma.downloadFile.count()
    ]);
    res.set('Content-Range', `files ${skip}-${skip + files.length}/${total}`);
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/files/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const file = await prisma.downloadFile.findUnique({ where: { id: (req.params.id as string) } });
    if (!file) return res.status(404).json({ message: 'Not found' });
    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/files', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const file = await prisma.downloadFile.create({ data: req.body });
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/files/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const file = await prisma.downloadFile.update({
      where: { id: (req.params.id as string) },
      data: req.body
    });
    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/files/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.downloadFile.delete({ where: { id: (req.params.id as string) } });
    res.json({ id: (req.params.id as string) });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
