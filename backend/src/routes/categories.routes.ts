import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q, status, accessLevel, tags, parentId } = req.query;

    let whereClause: any = {};
    if (q) {
      whereClause.title = { contains: String(q), mode: 'insensitive' };
    }
    if (status) whereClause.status = status;
    if (accessLevel) whereClause.accessLevel = accessLevel;
    if (tags) whereClause.tags = { contains: String(tags), mode: 'insensitive' };
    if (parentId) whereClause.parentId = parentId;

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { id: 'asc' };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: whereClause,
        include: { 
          parent: true,
          events: {
            select: { published: true }
          }
        },
        skip,
        take,
        orderBy
      }),
      prisma.category.count({ where: whereClause })
    ]);

    const parsedCategories = categories.map(cat => {
      const { events, ...rest } = cat as any;
      const publishedCount = events.filter((e: any) => e.published).length;
      const hiddenCount = events.filter((e: any) => !e.published).length;
      return {
        ...rest,
        publishedCount,
        hiddenCount,
        archivedCount: 0,
        trashCount: 0
      };
    });

    res.set('Content-Range', `categories ${skip}-${skip + parsedCategories.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(parsedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET single category
router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id as string },
      include: {
        events: {
          select: { published: true }
        }
      }
    });
    if (!category) return res.status(404).json({ message: 'Not found' });
    
    const { events, ...rest } = category;
    const publishedCount = events.filter(e => e.published).length;
    const hiddenCount = events.filter(e => !e.published).length;
    
    res.json({
      ...rest,
      publishedCount,
      hiddenCount,
      archivedCount: 0,
      trashCount: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// CREATE category (Admin only)
router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const category = await prisma.category.create({
      data: req.body
    });
    res.status(201).json(category);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Alias already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// UPDATE category (Admin only)
router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Alias already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE category (Admin only)
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id as string }
    });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
