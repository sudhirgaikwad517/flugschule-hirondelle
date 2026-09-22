// Every top-level static path segment already used by frontend/src/App.tsx's
// route tree. A new admin-created Page (see pages.routes.ts) must not use
// any of these as its slug, since the app's existing static routes always
// take priority over the catch-all ":slug" route - a Page created with one
// of these slugs would simply never be reachable (silently shadowed), which
// is worse than rejecting it up front. Keep this in sync with App.tsx.
export const RESERVED_SLUGS = new Set([
  'news',
  'downloads',
  'partner',
  'search',
  'events',
  'ausbildung',
  'performance',
  'reisen',
  'buchungskalender',
  'tandem',
  'service',
  'infos',
  'agb',
  'widerrufsbelehrung',
  'faq',
  'datenschutz',
  'impressum',
  'bewertung',
  'veranstaltungsorte',
  'veranstaltungsort',
  'veranstalter',
  'shop',
  'anmeldung',
  'profil',
  'booking-success',
  'booking-cancel',
  'newsletter',
  'admin',
]);
