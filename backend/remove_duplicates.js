const { prisma } = require('./dist/utils/prisma');

async function main() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      startDate: true,
      bookings: {
        select: { id: true }
      }
    }
  });

  const seen = {};
  const duplicates = [];

  for (const e of events) {
    const key = e.title + '|' + e.startDate.toISOString();
    if (seen[key]) {
      duplicates.push({
        event1: seen[key],
        event2: e
      });
    } else {
      seen[key] = e;
    }
  }

  console.log(`Found ${duplicates.length} pairs of duplicates`);
  
  // Let's delete the one with no bookings if possible
  let deletedCount = 0;
  for (const pair of duplicates) {
    const e1 = pair.event1;
    const e2 = pair.event2;
    
    // Choose the one without bookings
    let toDelete = null;
    if (e1.bookings.length === 0 && e2.bookings.length === 0) {
      toDelete = e2;
    } else if (e1.bookings.length === 0) {
      toDelete = e1;
    } else if (e2.bookings.length === 0) {
      toDelete = e2;
    }

    if (toDelete) {
      // Need to delete dependencies first
      await prisma.eventTicket.deleteMany({ where: { eventId: toDelete.id } });
      await prisma.eventFile.deleteMany({ where: { eventId: toDelete.id } });
      await prisma.event.delete({ where: { id: toDelete.id } });
      deletedCount++;
      console.log(`Deleted duplicate: ${toDelete.title} on ${toDelete.startDate}`);
    } else {
      console.log(`COULD NOT DELETE: ${e1.title} on ${e1.startDate} because both have bookings!`);
    }
  }
  console.log(`Successfully deleted ${deletedCount} duplicates.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
