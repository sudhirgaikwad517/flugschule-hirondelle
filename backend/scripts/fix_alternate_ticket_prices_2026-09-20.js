// Fix: EventTicket.price for Matukio "different_fees_override" alternate
// products (Tandem, Kombikurs, etc. - overrides with NO real
// published_up/published_down date window, as opposed to the genuine
// time-limited discounts already handled by the 2026-09-20 discount-fix
// script) was migrated using the RAW override value directly instead of
// running it through old Matukio's real price formula:
//   value_is_percent ? (discount ? fee*(1-value/100) : fee*(1+value/100))
//                     : (discount ? fee-value : fee+value)
// (administrator/components/com_matukio/helpers/fees.php lines ~134-155,
// the exact same formula for both the event-specific-override branch and
// the global-fallback branch).
//
// Verified against REAL historical payment records in the old DB
// (hiron_matukio_bookings.payment_brutto) for event 769's Wiederholung
// (raw value 500, fee 890): customers were actually charged 390.00 =
// 890-500, not 500 - and for Kombikurs (raw value 890, same fee):
// customers were actually charged 0.00 = 890-890, not 890. The formula
// output matches real charged amounts exactly; the currently-stored ticket
// price does not.
//
// Scope, per a dry-run scan: 335 of 361 tiered (non-date-windowed) events,
// 907 individual tickets. This script is idempotent - already-correct
// tickets are left untouched - and only ever UPDATEs EventTicket.price in
// place (never touches id, never deletes/recreates), so existing
// bookings/BookingItems keep referencing the same ticket safely.
//
// Usage:
//   node scripts/fix_alternate_ticket_prices_2026-09-20.js --dry-run
//   node scripts/fix_alternate_ticket_prices_2026-09-20.js            (applies + writes .sql)

require('dotenv/config');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const DRY_RUN = process.argv.includes('--dry-run');

function stripEntities(s) {
  return (s || '').replace(/&#?\w+;/g, '').trim();
}

function computeExpectedPrice(fee, override) {
  const value = parseFloat(override.value) || 0;
  // Old data mixes native JSON booleans (true/false) with stringified
  // "1"/"0" for these two flags across different records - sometimes even
  // within the same event's override list (see event 705: one entry uses
  // "discount":"1", the next uses "discount":false). Must treat all
  // truthy spellings the same way, verified against real historical
  // payment_brutto amounts for both representations.
  const isPercent = [true, 'true', 1, '1'].includes(override.percent);
  const isDiscount = [true, 'true', 1, '1'].includes(override.discount);
  let price = fee;
  if (isPercent) price = isDiscount ? fee * (1 - value / 100) : fee * (1 + value / 100);
  else price = isDiscount ? fee - value : fee + value;
  return Math.round(price * 100) / 100;
}

(async () => {
  const oldConn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'd03dbe51', charset: 'utf8mb4' });
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter });

  const events = await prisma.event.findMany({
    where: { eventNumber: { not: null } },
    include: { tickets: true }
  });

  const updates = []; // { ticketId, eventId, eventNumber, ticketName, oldPrice, newPrice }
  const unmatched = []; // overrides that couldn't be confidently matched to a ticket by name

  for (const event of events) {
    if (!event.tickets || event.tickets.length <= 1) continue;

    const [rows] = await oldConn.query(
      'SELECT id, fees, different_fees_override FROM hiron_matukio WHERE id = ?',
      [Number(event.eventNumber)]
    );
    const oldRow = rows[0];
    if (!oldRow || !oldRow.different_fees_override) continue;

    let overrides;
    try { overrides = JSON.parse(oldRow.different_fees_override); } catch (e) { continue; }
    if (!Array.isArray(overrides) || overrides.length === 0) continue;

    // Real time-limited discounts (with a date window) are stored as
    // eventTieredFees, not tickets - already handled by the earlier
    // discount-fix script. Skip any event where an override still has a
    // date window so we never touch that separate, already-correct path.
    if (overrides.some(o => o.published_up || o.published_down)) continue;

    const fee = parseFloat(oldRow.fees) || 0;
    const remainingTickets = event.tickets.filter(t => t.name !== 'Normal');

    for (const o of overrides) {
      const title = stripEntities(o.title);
      const expectedPrice = computeExpectedPrice(fee, o);

      // Exact name match first, since that's what the migration script
      // itself used to create these tickets.
      let ticket = remainingTickets.find(t => t.name === title);
      if (!ticket) {
        unmatched.push({ eventId: event.id, eventNumber: event.eventNumber, overrideTitle: title, expectedPrice });
        continue;
      }

      if (Math.abs(ticket.price - expectedPrice) > 0.01) {
        updates.push({
          ticketId: ticket.id,
          eventId: event.id,
          eventNumber: event.eventNumber,
          ticketName: ticket.name,
          oldPrice: ticket.price,
          newPrice: expectedPrice
        });
      }
    }
  }

  console.log(`Tickets to update: ${updates.length}`);
  console.log(`Unmatched overrides (no name match, left untouched): ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('First 20 unmatched:', JSON.stringify(unmatched.slice(0, 20), null, 2));
  }

  if (DRY_RUN) {
    console.log('\n--- DRY RUN: sample of first 30 updates ---');
    console.log(JSON.stringify(updates.slice(0, 30), null, 2));
    await oldConn.end();
    await prisma.$disconnect();
    return;
  }

  const sqlLines = [
    '-- Fix EventTicket.price for Matukio alternate-product overrides (2026-09-20)',
    '-- Generated by fix_alternate_ticket_prices_2026-09-20.js - see that file for full rationale.',
    ''
  ];

  for (const u of updates) {
    await prisma.eventTicket.update({ where: { id: u.ticketId }, data: { price: u.newPrice } });
    sqlLines.push(`UPDATE EventTicket SET price = ${u.newPrice} WHERE id = '${u.ticketId}'; -- event ${u.eventNumber} "${u.ticketName}": ${u.oldPrice} -> ${u.newPrice}`);
  }

  const sqlPath = path.join(__dirname, 'fix_alternate_ticket_prices_2026-09-20.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n') + '\n');
  console.log(`\nApplied ${updates.length} updates. SQL file written to ${sqlPath}`);

  await oldConn.end();
  await prisma.$disconnect();
})();
