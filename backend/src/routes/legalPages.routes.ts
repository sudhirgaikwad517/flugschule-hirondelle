import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { LEGAL_PAGE_DEFAULTS as DEFAULTS } from '../data/legalPageDefaults';
import { RESERVED_SLUGS } from '../data/reservedSlugs';

const router = Router();

const normalizeSlug = (value: string) =>
  String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function slugTaken(slug: string, ownId: string, ownKind: string | null): Promise<boolean> {
  // "agb"/"widerrufsbelehrung"/"datenschutz"/"impressum" are in
  // RESERVED_SLUGS precisely because they're this page's own hardcoded
  // App.tsx route - renaming back to your own kind must stay allowed.
  const isOwnKind = !!ownKind && slug === ownKind;
  if (!isOwnKind && RESERVED_SLUGS.has(slug)) return true;
  const [page, dup, settings, other] = await Promise.all([
    prisma.page.findUnique({ where: { slug } }),
    prisma.fixedPageDuplicate.findUnique({ where: { slug } }),
    prisma.fixedPageSettings.findFirst({ where: { slug } }),
    prisma.legalPage.findFirst({ where: { slug, NOT: { id: ownId } } }),
  ]);
  return !!page || !!dup || !!settings || !!other;
}

// Looks up/creates by the stable `kind` (agb/widerruf/datenschutz/
// impressum), never by `slug` - slug is admin-editable (see PUT below) and
// must never be used to decide whether a default row already exists, or a
// rename would make this recreate a duplicate under the original slug.
async function getOrCreateByKind(kind: string) {
  let page = await prisma.legalPage.findUnique({ where: { kind } });
  if (!page) {
    // Pre-existing rows from before `kind` existed were only ever created
    // with slug === kind - adopt one of those instead of creating a
    // second row for the same page.
    page = await prisma.legalPage.findUnique({ where: { slug: kind } });
    if (page && !page.kind) {
      page = await prisma.legalPage.update({ where: { id: page.id }, data: { kind } });
    }
  }
  if (!page) {
    const fallback = DEFAULTS[kind] || { title: kind, content: '' };
    page = await prisma.legalPage.create({ data: { slug: kind, kind, ...fallback } });
  }
  return page;
}

// Public: fetch by the stable kind - used by the 4 hardcoded App.tsx
// routes, which stay on their own fixed path regardless of the current
// (possibly admin-renamed) `slug`.
router.get('/public/by-kind/:kind', async (req, res) => {
  try {
    const page = await getOrCreateByKind(req.params.kind as string);
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public: fetch by the CURRENT slug (admin-renamed or not) - used by the
// generic ":slug" catch-all (FixedPageRouter.tsx) when a visitor lands on
// a renamed legal page's new URL directly. Deliberately does NOT auto-create
// like getOrCreateByKind does - an arbitrary visited slug that doesn't
// match a real row should 404, not spawn a junk row.
router.get('/public/by-slug/:slug', async (req, res) => {
  try {
    const page = await prisma.legalPage.findUnique({ where: { slug: req.params.slug as string } });
    if (!page) return res.status(404).json({ message: 'Not found' });
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin list (react-admin data provider expects an array)
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    for (const kind of Object.keys(DEFAULTS)) {
      await getOrCreateByKind(kind);
    }
    const pages = await prisma.legalPage.findMany({ orderBy: { slug: 'asc' } });
    res.set('Content-Range', `legalPages 0-${pages.length}/${pages.length}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const page = await prisma.legalPage.findUnique({ where: { id: req.params.id as string } });
    if (!page) return res.status(404).json({ message: 'Not found' });
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const existing = await prisma.legalPage.findUnique({ where: { id: req.params.id as string } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const { title, content } = req.body;
    let slug = existing.slug;
    if (req.body.slug !== undefined) {
      const normalized = normalizeSlug(req.body.slug);
      if (!normalized) return res.status(400).json({ message: 'Slug darf nicht leer sein.' });
      if (normalized !== existing.slug && (await slugTaken(normalized, existing.id, existing.kind))) {
        return res.status(400).json({ message: `Der Slug "${normalized}" wird bereits verwendet.` });
      }
      slug = normalized;
    }

    const page = await prisma.legalPage.update({
      where: { id: req.params.id as string },
      data: { title, content, slug }
    });
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
