import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { DEFAULT_FORM_SETTINGS, resolveFormSettings } from '../utils/formSettings';

// Generic form-field configuration (matches Joomla Visforms' real
// capability: an admin can add/remove/reorder/retype ANY field on a form,
// not just relabel ones the code shipped with - see FormConfig/ServiceOrder
// in schema.prisma). One row per real form; today that's just
// "service-auftrag", the only form this site actually has.

const router = Router();

router.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Content-Range');
  next();
});

const normalizeSlug = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'checkbox' | 'radio' | 'select';

interface FormFieldDef {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

// Word-for-word the real fields the Service-Auftrag form has always had
// (ServiceAuftrag.tsx before this became configurable) - the starting
// point every fresh "default" row seeds from, so nothing changes visually
// on first load of the new dynamic form/builder.
const SERVICE_AUFTRAG_DEFAULT_FIELDS: FormFieldDef[] = [
  { id: 'name', type: 'text', label: 'Name', required: true, order: 0 },
  { id: 'strasse', type: 'text', label: 'Straße', required: true, order: 1 },
  { id: 'plz', type: 'text', label: 'PLZ', required: true, order: 2 },
  { id: 'ort', type: 'text', label: 'Ort', required: true, order: 3 },
  { id: 'handy', type: 'tel', label: 'Handynr.', required: true, order: 4 },
  { id: 'email', type: 'email', label: 'E-Mail', required: true, order: 5 },
  { id: 'gleitschirm_check', type: 'checkbox', label: 'Gleitschirm-Check', required: false, order: 6 },
  { id: 'gs_hersteller', type: 'text', label: 'Hersteller des Gleitschirms', required: false, order: 7 },
  { id: 'gs_typ', type: 'text', label: 'Typ / Name des Gleitschirms', required: false, order: 8 },
  { id: 'gs_farbe', type: 'text', label: 'Farbe des Gleitschirms', required: false, order: 9 },
  { id: 'gs_anmerkung', type: 'textarea', label: 'Anmerkung / Hinweise', required: false, placeholder: 'z. B. Leine defekt, bitte austauschen / Loch im Obersegel etc.', order: 10 },
  { id: 'rettung_packen', type: 'checkbox', label: 'Rettung packen', required: false, order: 11 },
  { id: 'ret_hersteller', type: 'text', label: 'Hersteller / Typ der Rettung', required: false, placeholder: 'Wir packen alle Standardretter vom Typ Rund- bzw. Kreuzkappen. Retter, die nicht bei uns gekauft wurden bitte ggf. vorab abklären.', order: 12 },
  { id: 'ret_alter', type: 'text', label: 'Alter der Rettung', required: false, placeholder: 'ca. in Jahren', order: 13 },
  { id: 'sonstiges', type: 'text', label: 'Sonstiges', required: false, order: 14 },
  {
    id: 'abgabe', type: 'radio', label: 'Abgabe in', required: false, order: 15,
    options: [
      'Weinheim > zwecks Termin Newsletter beachten',
      'Landau > jederzeit möglich - Termin bitte telefonisch anfragen',
    ],
  },
];

// Word-for-word the real intro paragraphs the public Service-Auftrag page has
// always shown (ServiceAuftrag.tsx before this became editable) - seeded so
// nothing changes visually until an admin actually edits it via the new
// "Einleitungstext" rich text field.
const SERVICE_AUFTRAG_DEFAULT_INTRO = `<p>Bitte ausgefüllten Auftrag ausdrucken und zusammen mit der Ausrüstung in unserer Flugschule in Weinheim oder alternativ in Landau vorbeibringen.</p><p><strong>69469 Weinheim, Untergasse 27:</strong> bitte wegen Öffnungszeiten Newsletter beachten</p><p><strong>76829 Landau, Am Birnbach 6:</strong> Termin bitte telefonisch (+49 (0)6201 8452097) oder per E-Mail (info@fs-hirondelle.de) vereinbaren</p>`;

// Matches old's real DB row for this exact form (deep-verified earlier this
// project: saveresult=1) - every other tab defaults to DEFAULT_FORM_SETTINGS.
const SERVICE_AUFTRAG_DEFAULT_SETTINGS = {
  ...DEFAULT_FORM_SETTINGS,
  ergebnis: { ...DEFAULT_FORM_SETTINGS.ergebnis, saveResult: true },
};

const DEFAULTS: Record<string, { title: string; fields: FormFieldDef[]; introText: string; settings: typeof DEFAULT_FORM_SETTINGS }> = {
  'service-auftrag': {
    title: 'Service-Auftrag',
    fields: SERVICE_AUFTRAG_DEFAULT_FIELDS,
    introText: SERVICE_AUFTRAG_DEFAULT_INTRO,
    settings: SERVICE_AUFTRAG_DEFAULT_SETTINGS,
  },
};

async function getOrCreate(id: string) {
  let config = await prisma.formConfig.findUnique({ where: { id } });
  if (!config) {
    const seed = DEFAULTS[id] || { title: id, fields: [], introText: '', settings: DEFAULT_FORM_SETTINGS };
    config = await prisma.formConfig.create({
      data: { id, title: seed.title, fields: seed.fields as any, introText: seed.introText, settings: seed.settings as any },
    });
  }
  return config;
}

// Public: the form itself fetches its own field config to render. Also
// increments "hits" - matches old Visforms' real behavior exactly
// (site-side VisformsModel::addHits(), run on every public form-page view).
// Only the subset of `settings` the public page actually needs to RENDER
// (spam honeypot toggle, layout/processing-message cosmetics) is exposed -
// email addresses, spam-check API keys and IP allow/blacklists stay
// admin-only, even though none of this form's defaults are actually secret.
router.get('/:id/public', async (req, res) => {
  try {
    const config = await getOrCreate(req.params.id as string);
    if (!config.published) return res.status(404).json({ message: 'Formular nicht gefunden' });
    prisma.formConfig.update({ where: { id: config.id }, data: { hits: { increment: 1 } } }).catch(() => {});
    const settings = resolveFormSettings(config.settings);
    res.json({
      ...config,
      settings: undefined,
      publicSettings: {
        honeypotEnabled: settings.spam.honeypot,
        ...settings.advanced.layout,
        poweredBy: settings.advanced.poweredBy,
        allowFrontendDataView: settings.frontend.allowFrontendDataView,
      },
    });
  } catch (error) {
    console.error('Error fetching form config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin: list all forms - matches old Visforms' real "Formulare" list
// (administrator/components/com_visforms/views/visforms) - "Felder"/"Daten"
// are live-computed counts (a correlated subquery there, the same idea
// here), not stored columns.
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, q, published, accessLevel, language } = req.query;

    const whereClause: any = {};
    if (q) whereClause.OR = [{ title: { contains: String(q) } }, { id: { contains: String(q) } }];
    if (published !== undefined) whereClause.published = published === 'true';
    if (accessLevel) whereClause.accessLevel = String(accessLevel);
    if (language) whereClause.language = String(language);

    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 20;
    const orderBy: any = _sort ? { [String(_sort)]: _order === 'ASC' ? 'asc' : 'desc' } : { createdAt: 'desc' };

    const [configs, total] = await Promise.all([
      prisma.formConfig.findMany({ where: whereClause, skip, take, orderBy }),
      prisma.formConfig.count({ where: whereClause }),
    ]);

    const withCounts = await Promise.all(
      configs.map(async (c) => ({
        ...c,
        fieldsCount: Array.isArray(c.fields) ? (c.fields as any[]).length : 0,
        dataCount: await prisma.serviceOrder.count({ where: { formId: c.id } }),
      }))
    );

    res.set('Content-Range', `formconfigs ${skip}-${skip + withCounts.length}/${total}`);
    res.json(withCounts);
  } catch (error) {
    console.error('Error listing form configs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin: create a brand-new form - matches old's real "+ Neu" button.
router.post('/', authenticateJWT, authorizeAdmin, async (req: any, res) => {
  try {
    const { title } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Titel ist erforderlich' });
    }
    const baseSlug = normalizeSlug(title);
    if (!baseSlug) return res.status(400).json({ message: 'Ungültiger Titel' });

    let id = baseSlug;
    let suffix = 2;
    while (await prisma.formConfig.findUnique({ where: { id } })) {
      id = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const author = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true, email: true } });

    const config = await prisma.formConfig.create({
      data: {
        id,
        title: String(title).trim(),
        fields: [],
        createdBy: author?.name || author?.email || null,
      },
    });
    res.status(201).json({ ...config, fieldsCount: 0, dataCount: 0 });
  } catch (error) {
    console.error('Error creating form config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const config = await getOrCreate(req.params.id as string);
    res.json({ ...config, settings: resolveFormSettings(config.settings) });
  } catch (error) {
    console.error('Error fetching form config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { title, fields, published, accessLevel, language, introText, settings } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (fields !== undefined) data.fields = fields;
    if (published !== undefined) data.published = published;
    if (accessLevel !== undefined) data.accessLevel = accessLevel;
    if (language !== undefined) data.language = language;
    if (introText !== undefined) data.introText = introText;
    if (settings !== undefined) data.settings = settings;

    const config = await prisma.formConfig.upsert({
      where: { id: req.params.id as string },
      update: data,
      create: { id: req.params.id as string, title: title || req.params.id as string, fields: fields || [], settings },
    });
    res.json({ ...config, settings: resolveFormSettings(config.settings) });
  } catch (error) {
    console.error('Error updating form config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin: delete a form - matches old's real "Aktionen > Löschen".
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.formConfig.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Formular gelöscht' });
  } catch (error) {
    console.error('Error deleting form config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
