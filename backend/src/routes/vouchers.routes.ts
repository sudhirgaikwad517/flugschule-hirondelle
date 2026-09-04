import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint to validate a voucher
router.post('/validate', async (req, res) => {
  try {
    const { code, eventId } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Kein Code angegeben' });

    const voucher = await prisma.voucher.findUnique({ where: { code } });
    if (!voucher) return res.status(404).json({ valid: false, message: 'Gutschein nicht gefunden' });

    if (!voucher.published) return res.status(400).json({ valid: false, message: 'Gutschein ist deaktiviert' });
    
    if (voucher.validFrom && new Date() < new Date(voucher.validFrom)) {
      return res.status(400).json({ valid: false, message: 'Gutschein noch nicht gültig' });
    }
    if (voucher.validUntil && new Date() > new Date(voucher.validUntil)) {
      return res.status(400).json({ valid: false, message: 'Gutschein ist abgelaufen' });
    }
    if (voucher.limit > 0 && voucher.usedCount >= voucher.limit) {
      return res.status(400).json({ valid: false, message: 'Gutschein-Limit erreicht' });
    }
    if (voucher.eventId && voucher.eventId !== eventId) {
      return res.status(400).json({ valid: false, message: 'Gutschein gilt nicht für dieses Event' });
    }

    res.json({
      valid: true,
      value: voucher.value,
      isPercentage: voucher.isPercentage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q, published } = req.query;

    let whereClause: any = {};
    if (q) {
      whereClause.code = { contains: String(q) };
    }
    if (published !== undefined) whereClause.published = published === 'true';

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { code: 'asc' };

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where: whereClause,
        skip,
        take,
        orderBy
      }),
      prisma.voucher.count({ where: whereClause })
    ]);

    res.set('Content-Range', `vouchers ${skip}-${skip + vouchers.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(vouchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { id: req.params.id as string }
    });
    if (!voucher) return res.status(404).json({ message: 'Not found' });
    res.json(voucher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.validFrom) data.validFrom = new Date(data.validFrom);
    if (data.validUntil) data.validUntil = new Date(data.validUntil);
    if (data.value) data.value = Number(data.value);
    if (data.limit) data.limit = Number(data.limit);

    const voucher = await prisma.voucher.create({
      data
    });
    res.status(201).json(voucher);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Gutscheincode existiert bereits' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.validFrom) data.validFrom = new Date(data.validFrom);
    if (data.validUntil) data.validUntil = new Date(data.validUntil);
    if (data.value) data.value = Number(data.value);
    if (data.limit) data.limit = Number(data.limit);

    const voucher = await prisma.voucher.update({
      where: { id: req.params.id as string },
      data
    });
    res.json(voucher);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Gutscheincode existiert bereits' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.voucher.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
