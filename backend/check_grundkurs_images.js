const { prisma } = require('./dist/utils/prisma');

async function main() {
  const events = await prisma.event.findMany({
    where: { 
      categoryRef: { title: { contains: 'Grundkurs' } },
      imageUrl: { not: null }
    },
    select: { title: true, imageUrl: true, detailImageUrl: true },
    take: 10
  });
  console.log(events);
}
main().catch(console.error).finally(() => prisma.$disconnect());
