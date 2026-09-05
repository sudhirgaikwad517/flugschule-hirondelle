import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

const SAFE_SELECT = {
  id: true, name: true, email: true, role: true, phone: true, username: true,
  address1: true, location: true, postalCode: true, country: true, birthDate: true,
  weight: true, blocked: true, createdAt: true, updatedAt: true,
};

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q, role, blocked, ids } = req.query;

    const whereClause: any = {};
    if (ids) {
      whereClause.id = { in: String(ids).split(',') };
    } else if (q) {
      const qStr = String(q);
      whereClause.OR = [
        { name: { contains: qStr } },
        { email: { contains: qStr } },
        { username: { contains: qStr } },
      ];
    }
    if (role) whereClause.role = role;
    if (blocked !== undefined) whereClause.blocked = blocked === 'true';

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where: whereClause, select: SAFE_SELECT, skip, take, orderBy }),
      prisma.user.count({ where: whereClause }),
    ]);

    res.set('Content-Range', `users ${skip}-${skip + users.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: SAFE_SELECT,
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

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { name, email, password, role, phone, username, address1, location, postalCode, country, birthDate, weight, blocked } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, E-Mail und Passwort sind erforderlich' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ message: 'Ein Benutzer mit dieser E-Mail existiert bereits' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name, email, password: passwordHash,
        role: role || 'CUSTOMER',
        phone, username, address1, location, postalCode, country, birthDate, weight,
        blocked: !!blocked,
      },
      select: SAFE_SELECT,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { name, email, password, role, phone, username, address1, location, postalCode, country, birthDate, weight, blocked } = req.body;

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.params.id) {
        res.status(400).json({ message: 'Ein anderer Benutzer verwendet diese E-Mail bereits' });
        return;
      }
    }

    const data: any = {
      name, email, role, phone, username, address1, location, postalCode, country, birthDate, weight,
    };
    if (blocked !== undefined) data.blocked = !!blocked;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data,
      select: SAFE_SELECT,
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
