const { prisma } = require('./dist/utils/prisma');
const fs = require('fs');

async function main() {
  const events = await prisma.event.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      alias: true,
      categoryRef: { select: { title: true } },
      startDate: true,
      imageUrl: true,
      detailImageUrl: true
    },
    orderBy: { startDate: 'desc' }
  });
  
  const stats = {
    total: events.length,
    missingImage: events.filter(e => !e.imageUrl).length,
    missingDetailImage: events.filter(e => !e.detailImageUrl).length,
    categories: {}
  };
  
  for (const e of events) {
    const cat = e.categoryRef?.title || 'None';
    if (!stats.categories[cat]) stats.categories[cat] = { total: 0, missing: 0 };
    stats.categories[cat].total++;
    if (!e.imageUrl) {
      stats.categories[cat].missing++;
    }
  }

  const missingGrundkurs = events.filter(e => !e.imageUrl && e.categoryRef?.title?.includes('Grundkurs')).map(e => ({
    title: e.title,
    alias: e.alias,
    date: e.startDate
  }));
  
  const duplicates = [];
  const seen = {};
  for (const e of events) {
    const key = e.title + '|' + e.startDate.toISOString();
    if (seen[key]) {
      duplicates.push({ title: e.title, date: e.startDate });
    } else {
      seen[key] = true;
    }
  }

  fs.writeFileSync('image_stats.json', JSON.stringify({
    stats,
    missingGrundkurs,
    duplicatesCount: duplicates.length,
    sampleDuplicates: duplicates.slice(0, 5)
  }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
