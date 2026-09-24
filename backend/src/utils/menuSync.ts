import { prisma } from './prisma';

// Keeps admin-managed Menü entries (MenuItem/MenuSubItem - see menu.routes.ts)
// in sync with a page's own draft/published status: any menu item or
// sub-item pointing at `url` gets deactivated the instant that page goes to
// draft, and reactivated the instant it's published again. Without this, a
// drafted page stayed fully reachable via the header/footer nav, and an
// admin had to remember to also flip its menu entry off manually.
// Called from fixedPageSettings.routes.ts, pages.routes.ts and
// fixedPageDuplicates.routes.ts on every status-changing update. Matches on
// the CURRENT url only - a rename done in the same save as a draft/publish
// toggle won't chase the page's previous url.
export async function syncMenuPublishedForUrl(url: string, published: boolean) {
  if (!url) return;
  await Promise.all([
    prisma.menuItem.updateMany({ where: { url }, data: { published } }),
    prisma.menuSubItem.updateMany({ where: { url }, data: { published } }),
  ]);
}
