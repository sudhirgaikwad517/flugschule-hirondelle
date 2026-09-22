import { prisma } from '../src/utils/prisma';

// One-time seed matching the header nav that used to be hardcoded in
// Header.tsx, so the live site doesn't go blank the moment MenuItem/
// MenuSubItem replace it. Safe to re-run: skips if any MenuItem already
// exists. Run with: npx tsx scripts/seed-menu.ts
const MENU = [
  {
    label: 'Ausbildung',
    url: '/ausbildung',
    subItems: [
      { label: 'Schnupper-/Einsteigerkurs', url: '/ausbildung/schnupperkurs' },
      { label: 'L-Schein (Grundkurs)', url: '/ausbildung/l-schein' },
      { label: 'A-Schein', url: '/ausbildung/a-schein' },
      { label: 'B-Schein', url: '/ausbildung/b-schein' },
      { label: 'Winde', url: '/ausbildung/windenschein' },
      { label: 'Tandem', url: '/ausbildung/tandemschein' },
      { label: 'Ausbildungskonzept', url: '/ausbildung/ausbildungskonzept' },
    ],
  },
  {
    label: 'Performance',
    url: '/performance',
    subItems: [
      { label: 'Sicherheit', url: '/performance/sicherheitstraining' },
      { label: 'Rettungsgeräte', url: '/performance/rettungsgeraetetraining' },
      { label: 'Refresher', url: '/performance/refresher' },
      { label: 'Groundhandling', url: '/performance/groundhandling' },
    ],
  },
  {
    label: 'Reisen',
    url: '/reisen',
    // imageUrl on every sub-item -> Header.tsx renders this dropdown as an
    // image-tile mega menu (see NavDropdown), matching the old hardcoded
    // Reisen block these replaced.
    subItems: [
      { label: 'Brasilien', url: '/reisen/brasilien-tour', imageUrl: '/images/reisen/brasilien.jpg' },
      { label: 'Kolumbien', url: '/reisen/kolumbien-tour', imageUrl: '/images/reisen/kolumbien.jpg' },
      { label: 'Südafrika', url: '/reisen/suedafrika-tour', imageUrl: '/images/reisen/suedafrika.jpg' },
      { label: 'Bassano', url: '/reisen/bassano-tour', imageUrl: '/images/reisen/bassano.jpg' },
      { label: 'Griechenland', url: '/reisen/griechenland-tour', imageUrl: '/images/reisen/griechenland.jpg' },
      { label: 'Slowenien', url: '/reisen/slowenien-tour', imageUrl: '/images/reisen/slowenien.jpg' },
      { label: 'Bergamo', url: '/reisen/bergamo-tour', imageUrl: '/images/reisen/bergamo.jpg' },
      { label: 'Savoye', url: '/reisen/savoye-tour', imageUrl: '/images/reisen/savoye.jpg' },
      { label: 'Vogesen', url: '/reisen/vogesen-tour', imageUrl: '/images/reisen/vogesen.jpg' },
      { label: 'Pfalz', url: '/reisen/pfalz-tour', imageUrl: '/images/reisen/pfalz.jpg' },
    ],
  },
  { label: 'Buchungskalender', url: '/buchungskalender', subItems: [] },
  { label: 'Tandem', url: '/tandem', subItems: [] },
  {
    label: 'Service',
    url: '/service',
    subItems: [
      { label: 'Checks', url: '/service/2-jahres-check' },
      { label: 'Rettungspacken', url: '/service/rettungspacken' },
      { label: 'Trimmen', url: '/service/trimmtuning' },
      { label: 'Reparaturen', url: '/service/reparatur' },
      { label: 'Service-Auftrag', url: '/service/service-auftrag' },
    ],
  },
  {
    label: 'Infos',
    url: '/infos',
    subItems: [
      { label: 'Kontakt & Anfahrt', url: '/infos#kontakt' },
      { label: 'Team', url: '/infos/team' },
      { label: 'Gelände', url: '/infos/gelaende' },
      { label: 'Wetter', url: '/infos/wetter' },
      { label: 'Medien', url: '/infos/medien' },
      { label: 'Downloads', url: '/downloads' },
      { label: 'Gruppenevents', url: '/infos/gruppenevents' },
      { label: 'Gutscheine', url: '/infos/gutscheine' },
      { label: 'Versicherungen', url: '/infos/versicherungen' },
    ],
  },
];

async function main() {
  const existing = await prisma.menuItem.count();
  if (existing > 0) {
    console.log(`MenuItem already has ${existing} row(s) - skipping seed.`);
    return;
  }

  for (let i = 0; i < MENU.length; i++) {
    const { label, url, subItems } = MENU[i];
    await prisma.menuItem.create({
      data: {
        label,
        url,
        order: i,
        subItems: {
          create: subItems.map((s, j) => ({ label: s.label, url: s.url, imageUrl: (s as any).imageUrl, order: j })),
        },
      },
    });
  }
  console.log(`Menu seeded successfully! (${MENU.length} top-level items)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
