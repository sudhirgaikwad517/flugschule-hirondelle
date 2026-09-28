import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route to submit a service order form. Fully dynamic now (see
// FormConfig/formconfigs.routes.ts) - whatever fields the admin has
// configured for this form get submitted here as-is, not just the fixed
// set the form originally shipped with.
router.post('/public', async (req, res) => {
  try {
    const { formId, data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Ungültige Formulardaten' });
    }

    // Checkbox inputs submit "on"/undefined via a plain HTML form; normalize
    // to real booleans wherever the form config marked a field as a checkbox.
    const formConfig = await prisma.formConfig.findUnique({ where: { id: formId || 'service-auftrag' } });
    const checkboxFieldIds = new Set(
      ((formConfig?.fields as any[]) || []).filter((f) => f.type === 'checkbox').map((f) => f.id)
    );
    const normalized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      normalized[key] = checkboxFieldIds.has(key) ? (value === 'on' || value === true) : value;
    }

    const newOrder = await prisma.serviceOrder.create({
      data: {
        formId: formId || 'service-auftrag',
        data: normalized,
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
    const { _sort, _order, _start, _end, q, formId } = req.query;

    // "data.*" fields live inside a JSON blob (whatever field ids a form
    // config happened to have at submission time), so search/sort/paginate
    // in memory here rather than at the DB level - matches old's real
    // "Data records" search box (searches every submitted value) and
    // sortable columns, at a scale (a contact-style form's submissions)
    // where this is perfectly fine.
    let orders = await prisma.serviceOrder.findMany({
      where: formId ? { formId: String(formId) } : undefined,
    });

    if (q) {
      const needle = String(q).toLowerCase();
      orders = orders.filter((o) =>
        Object.values((o.data as any) || {}).some((v) => String(v ?? '').toLowerCase().includes(needle))
      );
    }

    const total = orders.length;

    if (_sort) {
      const sortField = String(_sort);
      const dir = String(_order).toUpperCase() === 'ASC' ? 1 : -1;
      const getValue = (o: any) =>
        sortField.startsWith('data.') ? (o.data as any)?.[sortField.slice(5)] : o[sortField];
      orders = [...orders].sort((a, b) => {
        const av = getValue(a);
        const bv = getValue(b);
        if (av === bv) return 0;
        if (av === undefined || av === null) return 1;
        if (bv === undefined || bv === null) return -1;
        return av > bv ? dir : -dir;
      });
    } else {
      orders = [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    let skip = 0;
    if (_start && _end) {
      skip = parseInt(_start as string);
      const take = parseInt(_end as string) - skip;
      orders = orders.slice(skip, skip + take);
    }

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
    const { data } = req.body;
    const updated = await prisma.serviceOrder.update({
      where: { id: (req.params.id as string) },
      data: { data },
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
