import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Get all users (React Admin expects Content-Range header for pagination)
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    
    // React Admin simple rest provider requires Content-Range
    const start = 0;
    const total = users.length;
    const end = Math.min(start + total, total);
    
    res.setHeader('Content-Range', `users ${start}-${end}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single user
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
