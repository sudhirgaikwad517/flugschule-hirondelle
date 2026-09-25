import { prisma } from '../src/utils/prisma';

// One-time seed matching the two slideshow image lists that used to be
// hardcoded in Banner.tsx (HOME_SLIDES / SUBPAGE_SLIDES), so the live site
// keeps looking exactly as it does today the moment Banner.tsx switches to
// admin-managed data (see useBannerSlides.ts) - and so Admin > Werbebanner
// actually reflects real, editable content instead of 8 unrelated leftover
// rows under positions ("home_top") that page rendering never read. Run
// with: npx tsx scripts/seed-banners.ts
//
// "title" doubles as the home page's caption text (shown over the slide);
// subpage banners never show a caption regardless of title (see
// Banner.tsx), so their titles here are just readable labels for the admin
// list/edit screens.
const HOME_BANNERS: { title: string; imageUrl: string; linkUrl?: string }[] = [
  { title: 'Erlebe die Freiheit des Fliegens', imageUrl: '/images/headers/slider4.jpg' },
  { title: 'Sicherheitstraining am Gardasee', imageUrl: '/images/headers/slider_gardasee.jpg' },
  { title: 'Türkisblaues Meer', imageUrl: '/images/headers/slider_griechenland2.jpg' },
  { title: 'Slider 1', imageUrl: '/images/headers/slider1.jpg' },
  { title: 'Genuss unter den Wolken', imageUrl: '/images/headers/sliderbschein.jpg' },
  { title: "Fliegen im Sommer an der Düne...", imageUrl: '/images/headers/slider11.jpg' },
  { title: '... und im Winter im Schnee', imageUrl: '/images/headers/P1030577.jpg' },
  { title: 'Groundhandling auf der Wiese', imageUrl: '/images/headers/slider_groundhandling.jpg' },
  { title: 'Traumhafte Ausblicke von ganz oben', imageUrl: '/images/headers/P1030623.jpg' },
  { title: 'Bergamo', imageUrl: '/images/headers/slider_bergamo.jpg' },
  { title: 'Über den Zuckerrohrfeldern in Kolumbien', imageUrl: '/images/headers/slider_kolumbien1.jpg' },
  { title: 'DSC00324', imageUrl: '/images/headers/DSC00324.jpg' },
  { title: 'Burgumrundung im Pfälzerwald', imageUrl: '/images/headers/slider_pfalz.jpg' },
  { title: 'Ausbildung auf höchstem Niveau', imageUrl: '/images/headers/slider2.jpg', linkUrl: '/' },
  { title: 'DSC05188', imageUrl: '/images/headers/DSC05188.png' },
  { title: 'Allgäuer Höhenluft', imageUrl: '/images/headers/slider_allgu.jpg' },
  { title: 'Unter der Sonne Brasiliens', imageUrl: '/images/headers/slider_brasilien.jpg' },
  { title: 'Bassano - das Mekka der Gleitschirmszene', imageUrl: '/images/headers/slider_bassano.jpg' },
  { title: "Doppelt fliegt's besser: Tandemflüge", imageUrl: '/images/headers/slider3.jpg' },
  { title: 'Griechenland - einmal die Küste abfliegen', imageUrl: '/images/headers/slider_griechenland1.jpg' },
  { title: 'Sightseeing von oben', imageUrl: '/images/headers/slider_griechenland3.jpg' },
  { title: 'Griechenland 4', imageUrl: '/images/headers/slider_griechenland4.jpg' },
  { title: 'Gechillt beim Landecocktail', imageUrl: '/images/headers/slider_griechenland5.jpg' },
  { title: 'Packservice am Landeplatz', imageUrl: '/images/headers/slider_kolumbien3.jpg' },
  { title: 'Kolumbien 4', imageUrl: '/images/headers/slider_kolumbien4.jpg' },
  { title: 'Kolumbien 5', imageUrl: '/images/headers/slider_kolumbien5.jpg' },
  { title: 'Im Sandkasten Südafrikas', imageUrl: '/images/headers/slider_sa6.jpg' },
  { title: 'Pfalz 2', imageUrl: '/images/headers/slider_pfalz2.jpg' },
  { title: 'Südafrika 4', imageUrl: '/images/headers/slider_sa4.jpg' },
  { title: 'Vom Pfälzer Rebenmeer in die Rheinebene', imageUrl: '/images/headers/slider_pfalz3.jpg' },
  { title: 'Südafrika 1', imageUrl: '/images/headers/slider_sa1.jpg' },
  { title: 'Paradiesisch an der Paradise Ridge in Südafrika', imageUrl: '/images/headers/slider_sa2.jpg' },
  { title: 'Südafrika 3', imageUrl: '/images/headers/slider_sa3.jpg' },
  { title: 'Spanien', imageUrl: '/images/headers/slider_spanien.jpg' },
  { title: 'Slowenien', imageUrl: '/images/headers/slider_slowenien.jpg' },
  { title: 'Südafrika 5', imageUrl: '/images/headers/slider_sa5.jpg' },
  { title: 'Das Stubaital', imageUrl: '/images/headers/slider_stubai.jpg' },
];

const SUBPAGE_BANNERS: { title: string; imageUrl: string }[] = [
  { title: 'Slider 11', imageUrl: '/images/headers/slider11.jpg' },
  { title: 'P1030623', imageUrl: '/images/headers/P1030623.jpg' },
  { title: 'Südafrika 4', imageUrl: '/images/headers/slider_sa4.jpg' },
  { title: 'Griechenland 4', imageUrl: '/images/headers/slider_griechenland4.jpg' },
  { title: 'Griechenland 1', imageUrl: '/images/headers/slider_griechenland1.jpg' },
  { title: 'Slider 4', imageUrl: '/images/headers/slider4.jpg' },
  { title: 'Bergamo', imageUrl: '/images/headers/slider_bergamo.jpg' },
  { title: 'Pfalz 3', imageUrl: '/images/headers/slider_pfalz3.jpg' },
  { title: 'Südafrika 2', imageUrl: '/images/headers/slider_sa2.jpg' },
  { title: 'Spanien', imageUrl: '/images/headers/slider_spanien.jpg' },
  { title: 'Kolumbien 1', imageUrl: '/images/headers/slider_kolumbien1.jpg' },
  { title: 'Südafrika 5', imageUrl: '/images/headers/slider_sa5.jpg' },
  { title: 'Bassano', imageUrl: '/images/headers/slider_bassano.jpg' },
  { title: 'Pfalz 2', imageUrl: '/images/headers/slider_pfalz2.jpg' },
  { title: 'Allgäu', imageUrl: '/images/headers/slider_allgu.jpg' },
  { title: 'Stubai', imageUrl: '/images/headers/slider_stubai.jpg' },
  { title: 'Slider 3', imageUrl: '/images/headers/slider3.jpg' },
  { title: 'Südafrika 6', imageUrl: '/images/headers/slider_sa6.jpg' },
  { title: 'Groundhandling', imageUrl: '/images/headers/slider_groundhandling.jpg' },
  { title: 'Slider 2', imageUrl: '/images/headers/slider2.jpg' },
  { title: 'Slowenien', imageUrl: '/images/headers/slider_slowenien.jpg' },
  { title: 'Griechenland 3', imageUrl: '/images/headers/slider_griechenland3.jpg' },
  { title: 'Kolumbien 3', imageUrl: '/images/headers/slider_kolumbien3.jpg' },
  { title: 'Griechenland 5', imageUrl: '/images/headers/slider_griechenland5.jpg' },
  { title: 'Pfalz', imageUrl: '/images/headers/slider_pfalz.jpg' },
  { title: 'Kolumbien 4', imageUrl: '/images/headers/slider_kolumbien4.jpg' },
  { title: 'Slider 1', imageUrl: '/images/headers/slider1.jpg' },
  { title: 'Brasilien', imageUrl: '/images/headers/slider_brasilien.jpg' },
  { title: 'Gardasee', imageUrl: '/images/headers/slider_gardasee.jpg' },
  { title: 'P1030577', imageUrl: '/images/headers/P1030577.jpg' },
  { title: 'Teneriffa', imageUrl: '/images/headers/slider_teneriffa.jpg' },
  { title: 'Südafrika 1', imageUrl: '/images/headers/slider_sa1.jpg' },
  { title: 'Kolumbien 5', imageUrl: '/images/headers/slider_kolumbien5.jpg' },
  { title: 'Griechenland 2', imageUrl: '/images/headers/slider_griechenland2.jpg' },
];

async function main() {
  const deleted = await prisma.adBanner.deleteMany({});
  console.log(`Removed ${deleted.count} stale AdBanner row(s).`);

  await prisma.adBanner.createMany({
    data: HOME_BANNERS.map((b, i) => ({ ...b, position: 'home', order: i, published: true })),
  });
  console.log(`Seeded ${HOME_BANNERS.length} "home" banners.`);

  await prisma.adBanner.createMany({
    data: SUBPAGE_BANNERS.map((b, i) => ({ ...b, position: 'subpage', order: i, published: true })),
  });
  console.log(`Seeded ${SUBPAGE_BANNERS.length} "subpage" banners.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
