import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

const DEFAULT_BODY_TEXT =
  'Wir verwenden Cookies und ähnliche Technologien, um Ihre Präferenzen zu ' +
  'speichern, die Effektivität unserer Kampagnen zu messen und nicht ' +
  'persönliche Daten zu analysieren, um die Leistung unserer Website zu ' +
  'verbessern. Indem Sie „Akzeptieren“ auswählen, erklären Sie sich mit der ' +
  'Verwendung aller Cookies einverstanden. Um Ihre Cookie-Einstellungen ' +
  'festzulegen, klicken Sie auf „Cookie-Einstellungen“. Sie können Ihre Cookie-' +
  'Einstellungen jederzeit unter „Mein Konto“ → „Cookie-Einverständnis“ oder ' +
  'unten auf der Website ändern.';

async function getOrCreateConfig() {
  let config = await prisma.cookieConsentConfig.findUnique({ where: { id: 'default' } });
  if (!config) {
    config = await prisma.cookieConsentConfig.create({
      data: { id: 'default', bodyText: DEFAULT_BODY_TEXT },
    });
  }
  return config;
}

// Public - read-only, used by the frontend banner. No auth required.
router.get('/public', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (error) {
    console.error('Error fetching cookie consent config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin - full read/write.
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (error) {
    console.error('Error fetching cookie consent config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.updatedAt;

    const config = await prisma.cookieConsentConfig.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', bodyText: DEFAULT_BODY_TEXT, ...data },
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating cookie consent config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
