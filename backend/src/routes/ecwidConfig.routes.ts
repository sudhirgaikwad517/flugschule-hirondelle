import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

// Get Ecwid config
router.get('/', async (req, res) => {
  try {
    let config = await prisma.ecwidConfig.findUnique({
      where: { id: 'default' }
    });

    if (!config) {
      config = await prisma.ecwidConfig.create({
        data: { id: 'default' }
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching Ecwid config:', error);
    res.status(500).json({ error: 'Failed to fetch Ecwid config' });
  }
});

// Upsert Ecwid config
router.put('/', async (req, res) => {
  try {
    const data = req.body;
    
    // Remove id and dates to let Prisma handle them safely
    delete data.id;
    delete data.updatedAt;

    const config = await prisma.ecwidConfig.upsert({
      where: { id: 'default' },
      update: data,
      create: {
        id: 'default',
        ...data
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating Ecwid config:', error);
    res.status(500).json({ error: 'Failed to update Ecwid config' });
  }
});

export default router;
