import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// GET published header nav, nested (Public) - consumed by Header.tsx
router.get('/menu/public', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { published: true, location: 'header' },
      include: {
        subItems: {
          where: { published: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET published footer links, flat (Public) - consumed by Footer.tsx. Footer
// items never have subItems (the footer is a flat link list), so this stays
// a plain array instead of the nested shape /menu/public returns.
router.get('/footerlinks/public', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { published: true, location: 'footer' },
      orderBy: { order: 'asc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for MenuItems (top-level entries, header or footer). Both
// MenuManager.tsx tabs (Header/Footer) hit these same endpoints, filtered by
// ?location=header|footer (defaults to "header").
router.get('/menuitems', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const location = req.query.location === 'footer' ? 'footer' : 'header';
    const items = await prisma.menuItem.findMany({
      where: { location },
      include: { subItems: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/menuitems', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { label, url, target, published } = req.body;
    const location = req.body.location === 'footer' ? 'footer' : 'header';
    const count = await prisma.menuItem.count({ where: { location } });
    const item = await prisma.menuItem.create({
      data: { label, url, target, published, location, order: count },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/menuitems/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { label, url, target, published, order } = req.body;
    const item = await prisma.menuItem.update({
      where: { id: req.params.id as string },
      data: { label, url, target, published, order },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/menuitems/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id as string });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk reorder of top-level items - body: [{ id, order }, ...]
router.post('/menuitems/reorder', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [];
    await prisma.$transaction(
      updates.map((u: { id: string; order: number }) =>
        prisma.menuItem.update({ where: { id: u.id }, data: { order: u.order } })
      )
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for MenuSubItems (submenu entries of a MenuItem)
router.post('/menusubitems', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { menuItemId, label, url, target, imageUrl, published } = req.body;
    const count = await prisma.menuSubItem.count({ where: { menuItemId } });
    const subItem = await prisma.menuSubItem.create({
      data: { menuItemId, label, url, target, imageUrl: imageUrl || null, published, order: count },
    });
    res.status(201).json(subItem);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/menusubitems/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { label, url, target, imageUrl, published, order } = req.body;
    const subItem = await prisma.menuSubItem.update({
      where: { id: req.params.id as string },
      data: { label, url, target, imageUrl: imageUrl || null, published, order },
    });
    res.json(subItem);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/menusubitems/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.menuSubItem.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id as string });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk reorder of one item's sub-items - body: [{ id, order }, ...]
router.post('/menusubitems/reorder', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [];
    await prisma.$transaction(
      updates.map((u: { id: string; order: number }) =>
        prisma.menuSubItem.update({ where: { id: u.id }, data: { order: u.order } })
      )
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
