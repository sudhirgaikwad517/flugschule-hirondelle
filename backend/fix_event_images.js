const { prisma } = require('./dist/utils/prisma');

const defaultImages = {
  "Reisen": "/images/1-reisen/itemimg-reisen.jpg",
  "Unbeschr. LF-Schein (B-Schein)": "/images/1-b-schein/itemimg-b-schein.jpg",
  "Schnupperkurs": "/images/1-schnuppern/itemimg-schnuppern.jpg",
  "Grundkurs": "/images/1-grundkurs/itemimg-grundkurs.jpg",
  "Höhenflugschulung (A-Schein)": "/images/1-a-schein/itemimg-a-schein.jpg",
  "Windenschulung": "/images/1-winde/itemimg-winde.jpg",
  "Refresherkurs": "/images/1-refresher/itemimg-refresher.jpg",
  "Rettungsgerätetraining": "/images/1-rettungsgeraete/itemimg-rettungsgeraete.jpg",
  "Performance Training": "/images/1-sicherheit/itemimg-sicherheit.jpg",
  "Sonstiges": "/images/1-medien/itemimg-medien.jpg",
  "Thermik- und Streckenseminar": "/images/1-thermik/itemimg-thermik.jpg",
  "Groundhandlingkurs": "/images/1-groundhandling/itemimg-groundhandling.jpg"
};

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, categoryRef: { select: { title: true } }, imageUrl: true, detailImageUrl: true }
  });

  let updated = 0;
  for (const e of events) {
    if (!e.imageUrl || e.imageUrl.trim() === '') {
      const cat = e.categoryRef?.title;
      if (cat && defaultImages[cat]) {
        await prisma.event.update({
          where: { id: e.id },
          data: { imageUrl: defaultImages[cat] }
        });
        updated++;
      }
    }
  }
  console.log(`Updated ${updated} events with fallback images.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
