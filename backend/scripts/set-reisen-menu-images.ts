import { prisma } from '../src/utils/prisma';

// One-time backfill: gives the already-seeded Reisen sub-items (see
// seed-menu.ts) their thumbnail back, using the same /images/reisen/*.jpg
// assets the old hardcoded mega menu in Header.tsx used. Safe to re-run
// (upserts by url match). Run with: npx tsx scripts/set-reisen-menu-images.ts
const IMAGES: Record<string, string> = {
  '/reisen/brasilien-tour': '/images/reisen/brasilien.jpg',
  '/reisen/kolumbien-tour': '/images/reisen/kolumbien.jpg',
  '/reisen/suedafrika-tour': '/images/reisen/suedafrika.jpg',
  '/reisen/bassano-tour': '/images/reisen/bassano.jpg',
  '/reisen/griechenland-tour': '/images/reisen/griechenland.jpg',
  '/reisen/slowenien-tour': '/images/reisen/slowenien.jpg',
  '/reisen/bergamo-tour': '/images/reisen/bergamo.jpg',
  '/reisen/savoye-tour': '/images/reisen/savoye.jpg',
  '/reisen/vogesen-tour': '/images/reisen/vogesen.jpg',
  '/reisen/pfalz-tour': '/images/reisen/pfalz.jpg',
};

async function main() {
  let updated = 0;
  for (const [url, imageUrl] of Object.entries(IMAGES)) {
    const result = await prisma.menuSubItem.updateMany({ where: { url }, data: { imageUrl } });
    updated += result.count;
  }
  console.log(`Set imageUrl on ${updated} Reisen sub-item(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
