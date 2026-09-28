import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { JWT_SECRET } from '../utils/config';
import { resolveFormSettings, replaceTokens } from '../utils/formSettings';
import { sendFormEmails } from '../services/formMailer.service';

const router = Router();

// A submitter MAY be a logged-in customer (see Profil.tsx's own
// localStorage 'token') but submitting this form has never required it -
// old's real form is public access. Reads the same JWT the rest of the app
// uses if present and valid; anything else (missing, expired, malformed) is
// silently treated as an anonymous submission rather than rejected.
function tryGetUserId(req: any): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload?.id || null;
  } catch {
    return null;
  }
}

// Public route to submit a service order form. Fully dynamic now (see
// FormConfig/formconfigs.routes.ts) - whatever fields the admin has
// configured for this form get submitted here as-is, not just the fixed
// set the form originally shipped with.
router.post('/public', async (req, res) => {
  try {
    const { formId: rawFormId, data, hp } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Ungültige Formulardaten' });
    }
    const formId = rawFormId || 'service-auftrag';

    const formConfig = await prisma.formConfig.findUnique({ where: { id: formId } });
    const settings = resolveFormSettings(formConfig?.settings);
    const fields = ((formConfig?.fields as any[]) || []) as { id: string; label: string; type: string; required?: boolean }[];

    // Old's real honeypot (visform-honeypot fieldset) - a field real users
    // never see or fill; anything in it means a bot filled every input on
    // the page indiscriminately. Responds exactly like a real success (never
    // reveals the form is protected) but skips the save/notification entirely.
    if (settings.spam.honeypot && hp) {
      return res.status(201).json({ message: 'OK' });
    }

    const checkboxFieldIds = new Set(fields.filter((f) => f.type === 'checkbox').map((f) => f.id));
    const normalized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      normalized[key] = checkboxFieldIds.has(key) ? (value === 'on' || value === true) : value;
    }

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
    const userId = tryGetUserId(req);

    let recordId = 'n/a';
    let createdAt = new Date();
    // Old's real saveresult=0 forms process email/redirect but never persist
    // a data row at all - honored here the same way, not just "hide it later".
    if (settings.ergebnis.saveResult) {
      const newOrder = await prisma.serviceOrder.create({
        data: {
          formId,
          data: normalized,
          ip,
          userId,
          published: settings.frontend.autoPublish,
        },
      });
      recordId = newOrder.id;
      createdAt = newOrder.createdAt;
    }

    if (formConfig && (settings.email.result.enabled || settings.email.receipt.enabled)) {
      sendFormEmails({
        formTitle: formConfig.title,
        recordId,
        createdAt,
        ip,
        fields,
        data: normalized,
        settings,
      }).catch((e) => console.error('sendFormEmails failed:', e));
    }

    res.status(201).json({
      message: 'OK',
      textResult: replaceTokens(settings.ergebnis.textResult, normalized),
      redirectUrl: settings.ergebnis.redirectUrl ? replaceTokens(settings.ergebnis.redirectUrl, normalized) : null,
    });
  } catch (error) {
    console.error('Error creating service order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public (auth required): "Datenanzeige im Frontend" - a logged-in
// submitter's own past submissions for this form, matching old's real
// frontend-data-view "own records only" default behavior (see
// visform-frontend-details' `ownrecordsonly` - gated to subscription-only
// there since the free tier can ONLY ever show your own records, which is
// exactly what this always does here).
router.get('/my-submissions/:formId', authenticateJWT, async (req: any, res) => {
  try {
    const formConfig = await prisma.formConfig.findUnique({ where: { id: req.params.formId } });
    if (!formConfig) return res.status(404).json({ message: 'Formular nicht gefunden' });
    const settings = resolveFormSettings(formConfig.settings);
    if (!settings.frontend.allowFrontendDataView) {
      return res.status(403).json({ message: 'Diese Ansicht ist für dieses Formular nicht aktiviert' });
    }
    const orders = await prisma.serviceOrder.findMany({
      where: { formId: req.params.formId, userId: req.user.id, published: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ form: { title: formConfig.title, fields: formConfig.fields, settings }, orders });
  } catch (error) {
    console.error('Error fetching my-submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/my-submissions/:formId/:orderId', authenticateJWT, async (req: any, res) => {
  try {
    const order = await prisma.serviceOrder.findUnique({ where: { id: req.params.orderId } });
    if (!order || order.formId !== req.params.formId || order.userId !== req.user.id || !order.published) {
      return res.status(404).json({ message: 'Nicht gefunden' });
    }
    const formConfig = await prisma.formConfig.findUnique({ where: { id: req.params.formId } });
    res.json({
      form: { title: formConfig?.title, fields: formConfig?.fields, settings: formConfig ? resolveFormSettings(formConfig.settings) : null },
      order,
    });
  } catch (error) {
    console.error('Error fetching my-submission detail:', error);
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
