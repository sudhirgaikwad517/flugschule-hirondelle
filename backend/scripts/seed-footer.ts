import { prisma } from '../src/utils/prisma';

// One-time seed matching the footer link list that used to be hardcoded in
// Footer.tsx (NAV_LINKS), so the live site doesn't lose its footer links the
// moment Footer.tsx switches to admin-managed data. Same MenuItem table as
// seed-menu.ts, just location: 'footer' instead of 'header', and no
// subItems (the footer is a flat list). Safe to re-run: skips if any footer
// MenuItem already exists. Run with: npx tsx scripts/seed-footer.ts
const FOOTER_LINKS = [
  { label: 'Home', url: '/' },
  { label: 'Reisen', url: '/reisen' },
  { label: 'Kalender', url: '/buchungskalender' },
  { label: 'Ausbildung', url: '/ausbildung' },
  { label: 'Shop', url: '/shop' },
  { label: 'Checks', url: '/service#2-jahres-check' },
  { label: 'Wetter', url: '/infos/wetter' },
  { label: 'Medien', url: '/infos/medien' },
  { label: 'Gelände', url: '/infos/gelaende' },
  { label: 'Team', url: '/infos/team' },
  { label: 'Tandem', url: '/ausbildung#tandem' },
  { label: 'FAQ', url: '/faq' },
  { label: 'Kontakt', url: '/infos#kontakt' },
  { label: 'Impressum', url: '/impressum' },
  { label: 'Datenschutzerklärung', url: '/datenschutz' },
];

async function main() {
  const existing = await prisma.menuItem.count({ where: { location: 'footer' } });
  if (existing > 0) {
    console.log(`Footer already has ${existing} MenuItem row(s) - skipping seed.`);
    return;
  }

  for (let i = 0; i < FOOTER_LINKS.length; i++) {
    const { label, url } = FOOTER_LINKS[i];
    await prisma.menuItem.create({ data: { label, url, location: 'footer', order: i } });
  }
  console.log(`Footer seeded successfully! (${FOOTER_LINKS.length} links)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
