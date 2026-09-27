// Old's LIVE site (fs-hirondelle.de) has 4 recurring course dates that were
// added there AFTER our migration snapshot was taken - they never made it
// into this app at all (confirmed: our local reference DB d03dbe51, the
// same one used for every other backfill this session, doesn't have them
// either - this isn't a bug in any of our own code/filters, it's genuinely
// missing migrated data): Schnupper-/Einsteigerkurs (bookingNumber 80/26,
// 81/26) and L-Schein Grundkurs (82/26, 83/26), both 2026-10-10 and
// 2026-10-17. This clones each from its nearest sibling instance
// (bookingNumber 42/26 / 63/26 - same course type, same fees/tickets/
// description/images), only overriding what's actually date-specific.
//
// Usage: node scripts/add_missing_recurring_dates_2026-09-27.js

require('dotenv/config');
const { PrismaClient, Prisma } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const NEW_INSTANCES = [
  { templateBookingNumber: '42/26', bookingNumber: '80/26', startDate: new Date('2026-10-10T08:00:00.000Z'), endDate: new Date('2026-10-11T15:00:00.000Z') },
  { templateBookingNumber: '42/26', bookingNumber: '81/26', startDate: new Date('2026-10-17T08:00:00.000Z'), endDate: new Date('2026-10-18T15:00:00.000Z') },
  { templateBookingNumber: '63/26', bookingNumber: '82/26', startDate: new Date('2026-10-10T08:00:00.000Z'), endDate: new Date('2026-10-11T15:00:00.000Z') },
  { templateBookingNumber: '63/26', bookingNumber: '83/26', startDate: new Date('2026-10-17T08:00:00.000Z'), endDate: new Date('2026-10-18T15:00:00.000Z') },
];

function registrationDeadlineFor(startDate) {
  const d = new Date(startDate);
  d.setUTCDate(d.getUTCDate() - 1);
  d.setUTCHours(15, 0, 0, 0);
  return d;
}

(async () => {
  const templateCache = {};
  for (const spec of NEW_INSTANCES) {
    if (templateCache[spec.templateBookingNumber]) continue;
    const template = await prisma.event.findFirst({
      where: { bookingNumber: spec.templateBookingNumber },
      include: { tickets: { orderBy: { order: 'asc' } } },
    });
    if (!template) {
      console.log(`Template ${spec.templateBookingNumber} not found - skipping its clones.`);
      continue;
    }
    templateCache[spec.templateBookingNumber] = template;
  }

  for (const spec of NEW_INSTANCES) {
    const existing = await prisma.event.findFirst({ where: { bookingNumber: spec.bookingNumber } });
    if (existing) {
      console.log(`${spec.bookingNumber} already exists - skipping.`);
      continue;
    }
    const template = templateCache[spec.templateBookingNumber];
    if (!template) continue;

    const {
      id, startDate, endDate, registrationDeadline, alias, bookingNumber,
      createdAt, updatedAt, views, tickets, ...rest
    } = template;

    const aliasSuffix = spec.bookingNumber.replace('/', '-');
    const created = await prisma.event.create({
      data: {
        ...rest,
        startDate: spec.startDate,
        endDate: spec.endDate,
        registrationDeadline: registrationDeadlineFor(spec.startDate),
        alias: `${alias}-${aliasSuffix}`,
        bookingNumber: spec.bookingNumber,
      },
    });

    for (const t of tickets) {
      const { id: ticketId, eventId, ...ticketRest } = t;
      await prisma.eventTicket.create({ data: { ...ticketRest, eventId: created.id } });
    }

    console.log(`Created ${created.title} (${spec.bookingNumber}) - ${spec.startDate.toISOString()} with ${tickets.length} ticket(s).`);
  }

  await prisma.$disconnect();
})();
