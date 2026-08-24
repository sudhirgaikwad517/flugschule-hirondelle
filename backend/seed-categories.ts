import { prisma } from './src/utils/prisma';

const categories = [
  { title: "Schnupperkurs", alias: "schnupperkurs", status: "PUBLISHED" },
  { title: "Grundkurs", alias: "grundkurs", status: "PUBLISHED" },
  { title: "Höhenflugschulung (A-Schein)", alias: "hoehenflugschulung", status: "PUBLISHED" },
  { title: "Unbeschr. LF-Schein (B-Schein)", alias: "unbeschr-lf-schein-b-schein", status: "PUBLISHED" },
  { title: "Windenschulung", alias: "windenschulung", status: "PUBLISHED" },
  { title: "Thermik- und Streckenseminar", alias: "thermik-und-streckenseminar", status: "PUBLISHED" },
  { title: "Performance Training", alias: "performancetraining", status: "PUBLISHED" },
  { title: "Rettungsgerätetraining", alias: "rettungsgeraetetraining", status: "PUBLISHED" },
  { title: "Groundhandlingkurs", alias: "groundhandlingkurs", status: "PUBLISHED" },
  { title: "Refresherkurs", alias: "refresherkurs", status: "PUBLISHED" },
  { title: "Reisen", alias: "reisen", status: "PUBLISHED" },
  { title: "Sonstiges", alias: "sonstiges", status: "PUBLISHED" },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { alias: cat.alias },
      update: {},
      create: {
        title: cat.title,
        alias: cat.alias,
        status: cat.status as any,
        accessLevel: "PUBLIC",
      }
    });
  }
  console.log("Categories seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
