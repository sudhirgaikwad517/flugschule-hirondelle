import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { subscribeToNewsletter } from './newsletters.routes';

const router = Router();

// Public: rendering config for an embedded form (see NewsletterFormBlock.tsx
// and DynamicPage.tsx's page-newsletter-form-block placeholder) - old
// AcyMailing's real Forms feature (a designed signup form feeding specific
// lists, asking for specific custom fields, with its own styling/messages).
router.get('/public/:id', async (req, res) => {
  try {
    const form = await prisma.newsletterForm.findUnique({ where: { id: req.params.id as string } });
    if (!form) return res.status(404).json({ message: 'Not found' });

    const fieldIds = (form.fieldIds || '').split(',').map((s) => s.trim()).filter(Boolean);
    const fields = fieldIds.length > 0
      ? await prisma.newsletterFieldDefinition.findMany({ where: { id: { in: fieldIds } }, orderBy: { order: 'asc' } })
      : [];

    res.json({ ...form, fields });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/public/:id/submit', async (req, res) => {
  try {
    const form = await prisma.newsletterForm.findUnique({ where: { id: req.params.id as string } });
    if (!form) return res.status(404).json({ message: 'Formular nicht gefunden' });

    const { name, email, customFields } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Gültige E-Mail-Adresse ist erforderlich' });
    }

    const codes = (form.listCodes || '').split(',').map((c) => c.trim()).filter(Boolean);
    if (codes.length === 0) {
      return res.status(500).json({ message: 'Dieses Formular hat keine Zielliste konfiguriert' });
    }

    const results = await Promise.all(codes.map((code) => subscribeToNewsletter(email, name, code)));

    // Custom field answers apply to every one of this form's target lists'
    // rows for this email - same one-row-per-list-membership shape
    // Newsletter already uses elsewhere (email_listType unique key).
    if (customFields && typeof customFields === 'object') {
      await prisma.newsletter.updateMany({
        where: { email: email.toLowerCase(), listType: { in: codes } },
        data: { customFields },
      });
    }

    const anyPendingConfirmation = results.some((r) => r.message.includes('bestätigen'));
    res.status(201).json({
      message: anyPendingConfirmation
        ? 'Bitte bestätigen Sie Ihre E-Mail-Adresse - wir haben Ihnen einen Link geschickt.'
        : form.successMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Absenden des Formulars' });
  }
});

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'DESC' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const [forms, total] = await Promise.all([
      prisma.newsletterForm.findMany({ skip, take, orderBy }),
      prisma.newsletterForm.count(),
    ]);

    res.set('Content-Range', `newsletterForms ${skip}-${skip + forms.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const form = await prisma.newsletterForm.findUnique({ where: { id: req.params.id as string } });
    if (!form) return res.status(404).json({ message: 'Not found' });
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const form = await prisma.newsletterForm.create({ data: req.body });
    res.status(201).json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const form = await prisma.newsletterForm.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.newsletterForm.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
