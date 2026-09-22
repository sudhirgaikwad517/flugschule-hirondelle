import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

const DEFAULT_PROMO_CARDS = [
  {
    title: 'Fliegen Lernen',
    boldLine: 'Der Anfang einer neuen Leidenschaft!',
    description: 'Reinschnuppern beim 1-Tageskurs oder Schnupperwochenende',
    image: '/images/startbuttons/startbutton_schnuppern.jpg',
    link: '/ausbildung/schnupperkurs',
  },
  {
    title: 'Shop Geöffnet',
    boldLine: 'Mittwoch, 2.9.26 16-19 Uhr',
    description: 'Alex und Sarah sind für euch in Weinheim im Laden, bitte unbedingt voranmelden!',
    image: '/images/startbuttons/gutschein.jpg',
    link: '/infos',
  },
  {
    title: 'On Tour...',
    boldLine: '23.1. - 6.2.2027 | Kolumbien',
    description: 'Fliegen über den grünen Landschaften des Valle del Cauca in den besten Fluggebieten von Cali Richtung Medellin...',
    image: '/images/bilder/2-tour-kolumbien/Kolumbien_3997_2.jpg',
    link: '/reisen/kolumbien-tour',
  },
];

const DEFAULT_TEAM_MEMBERS = [
  { name: 'Alex', image: '/images/team/schlink.jpg' },
  { name: 'Sarah', image: '/images/team/sarah.jpg' },
  { name: 'Tobi', image: '/images/team/tobi.jpg' },
  { name: 'Holger', image: '/images/team/holger.jpg' },
  { name: 'Markus', image: '/images/team/markus.jpg' },
];

const DEFAULT_HOCH_HINAUS_HTML =
  '<p>Willkommen bei der Flugschule Hirondelle, der Gleitschirmschule im Rhein-Main-Neckar Dreieck. Fliegen lernen mit dem <a href="/infos/team">Team Hirondelle</a> heißt: Persönliche und individuelle auf den Schüler zugeschnittene Ausbildung. Unser Team besteht aus sehr erfahrenen und ambitionierten Fluglehrern.</p>' +
  '<p>Alles natürlich an genialen Schulungshängen im Raum Odenwald, Kraichtal, Nahetal und in der Pfalz.</p>';

const DEFAULT_SECTION_TITLES = {
  newsEyebrow: 'AKTUELLES',
  newsTitle: 'NEWS',
  hochHinausEyebrowPrefix: '...mit dem',
  hochHinausEyebrowLinkText: 'Team Hirondelle',
  hochHinausTitle: 'HOCH HINAUS',
};

export const DEFAULTS = { promoCards: DEFAULT_PROMO_CARDS, teamMembers: DEFAULT_TEAM_MEMBERS, teamLink: '/infos/team', hochHinausHtml: DEFAULT_HOCH_HINAUS_HTML, ...DEFAULT_SECTION_TITLES };

// Public read - Home.tsx fetches this on mount, falling back to its own
// hardcoded copy if the row doesn't exist yet (mirrors the pagemedia
// fetch pattern already used there for images).
router.get('/public', async (_req, res) => {
  try {
    const content = await prisma.homeContent.findUnique({ where: { id: 'default' } });
    res.json(content || DEFAULTS);
  } catch (error) {
    console.error('Error fetching public home content:', error);
    res.status(500).json({ error: 'Failed to fetch home content' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    let content = await prisma.homeContent.findUnique({ where: { id } });
    if (!content) {
      content = await prisma.homeContent.create({ data: { id, ...DEFAULTS } });
    }
    res.json(content);
  } catch (error) {
    console.error('Error fetching home content:', error);
    res.status(500).json({ error: 'Failed to fetch home content' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const { promoCards, teamMembers, teamLink, hochHinausHtml, newsEyebrow, newsTitle, hochHinausEyebrowPrefix, hochHinausEyebrowLinkText, hochHinausTitle } = req.body;
    const updateData: any = {};
    if (promoCards !== undefined) updateData.promoCards = promoCards;
    if (teamMembers !== undefined) updateData.teamMembers = teamMembers;
    if (teamLink !== undefined) updateData.teamLink = teamLink;
    if (hochHinausHtml !== undefined) updateData.hochHinausHtml = hochHinausHtml;
    if (newsEyebrow !== undefined) updateData.newsEyebrow = newsEyebrow;
    if (newsTitle !== undefined) updateData.newsTitle = newsTitle;
    if (hochHinausEyebrowPrefix !== undefined) updateData.hochHinausEyebrowPrefix = hochHinausEyebrowPrefix;
    if (hochHinausEyebrowLinkText !== undefined) updateData.hochHinausEyebrowLinkText = hochHinausEyebrowLinkText;
    if (hochHinausTitle !== undefined) updateData.hochHinausTitle = hochHinausTitle;

    const content = await prisma.homeContent.upsert({
      where: { id },
      update: updateData,
      create: { id, ...DEFAULTS, ...req.body },
    });
    res.json(content);
  } catch (error) {
    console.error('Error updating home content:', error);
    res.status(500).json({ error: 'Failed to update home content' });
  }
});

// "Delete" for this content can't remove the /home-content data - there's
// no page to remove, Home.tsx's route always exists. This is a WordPress-
// style trash instead: snapshot the current row into ContentTrash (see
// trash.routes.ts, Admin > Papierkorb, for restore) then drop it, so the
// public/admin GETs above fall back to DEFAULTS until it's restored.
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const content = await prisma.homeContent.findUnique({ where: { id } });
    if (content) {
      const { id: _id, updatedAt, ...data } = content;
      await prisma.contentTrash.create({ data: { kind: 'homecontent', refId: id, title: 'Startseite', data } });
    }
    await prisma.homeContent.deleteMany({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error resetting home content:', error);
    res.status(500).json({ error: 'Failed to reset home content' });
  }
});

export default router;
