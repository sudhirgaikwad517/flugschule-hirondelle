import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route to submit a service order form
router.post('/public', async (req, res) => {
  try {
    const data = req.body;
    
    // Convert string "on" to boolean for checkboxes
    const gleitschirm_check = data.gleitschirm_check === 'on' || data.gleitschirm_check === true;
    const rettung_packen = data.rettung_packen === 'on' || data.rettung_packen === true;

    const newOrder = await prisma.serviceOrder.create({
      data: {
        name: data.name,
        strasse: data.strasse,
        plz: data.plz,
        ort: data.ort,
        handy: data.handy,
        email: data.email,
        gleitschirm_check,
        gs_hersteller: data.gs_hersteller || null,
        gs_typ: data.gs_typ || null,
        gs_farbe: data.gs_farbe || null,
        gs_anmerkung: data.gs_anmerkung || null,
        rettung_packen,
        ret_hersteller: data.ret_hersteller || null,
        ret_alter: data.ret_alter || null,
        sonstiges: data.sonstiges || null,
        abgabe: data.abgabe || null,
      },
    });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating service order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// React Admin CRUD routes (Protected)

// GET list
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    
    const queryOptions: any = {};
    if (_sort && _order) {
      queryOptions.orderBy = {
        [_sort as string]: (_order as string).toLowerCase(),
      };
    }
    
    let skip = 0;
    let take = 20;
    if (_start && _end) {
      skip = parseInt(_start as string);
      take = parseInt(_end as string) - skip;
      queryOptions.skip = skip;
      queryOptions.take = take;
    }
    
    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany(queryOptions),
      prisma.serviceOrder.count(),
    ]);

    res.set('Content-Range', `serviceorders ${skip}-${skip + orders.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET one
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const order = await prisma.serviceOrder.findUnique({
      where: { id: (req.params.id as string) },
    });
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT update
router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const updated = await prisma.serviceOrder.update({
      where: { id: (req.params.id as string) },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const deleted = await prisma.serviceOrder.delete({
      where: { id: (req.params.id as string) },
    });
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
