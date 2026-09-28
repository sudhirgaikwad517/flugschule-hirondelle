import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

// Generic form-field configuration (matches Joomla Visforms' real
// capability: an admin can add/remove/reorder/retype ANY field on a form,
// not just relabel ones the code shipped with - see FormConfig/ServiceOrder
// in schema.prisma). One row per real form; today that's just
// "service-auftrag", the only form this site actually has.

const router = Router();

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

const DEFAULTS: Record<string, { title: string; fields: FormFieldDef[] }> = {
  'service-auftrag': { title: 'Service-Auftrag', fields: SERVICE_AUFTRAG_DEFAULT_FIELDS },
};

async function getOrCreate(id: string) {
  let config = await prisma.formConfig.findUnique({ where: { id } });
  if (!config) {
    const seed = DEFAULTS[id] || { title: id, fields: [] };
    config = await prisma.formConfig.create({ data: { id, title: seed.title, fields: seed.fields as any } });
  }
  return config;
}

// Public: the form itself fetches its own field config to render.
router.get('/:id/public', async (req, res) => {
  try {
    const config = await getOrCreate(req.params.id as string);
    res.json(config);
  } catch (error) {
    console.error('Error fetching form config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const config = await getOrCreate(req.params.id as string);
    res.json(config);
  } catch (error) {
    console.error('Error fetching form config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { title, fields } = req.body;
    const config = await prisma.formConfig.upsert({
      where: { id: req.params.id as string },
      update: { title, fields },
      create: { id: req.params.id as string, title, fields },
    });
    res.json(config);
  } catch (error) {
    console.error('Error updating form config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
