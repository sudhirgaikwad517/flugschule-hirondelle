// Fix: a handful of Matukio "different_fees_override" entries were
// genuine, date-limited early-bird DISCOUNTS ("Frühbucherrabatt") on the
// event's own base fee - not separate, independently bookable products -
// but the migration turned every override entry into its own EventTicket
// regardless. That made a temporary discount show up on the public event
// page as a whole separate ticket type customers could pick instead of
// "Normal".
//
// Distinguishing signal (verified against the old DB, d03dbe51): the old
// override JSON carries published_up/published_down - a real validity
// window - ONLY for these early-bird discount entries. Every other
// override entry (real alternate products/course variants like "Tandem",
// "Kombikurs", "Nichtflieger") has both fields empty, and old Matukio's
// own booking-form dropdown (requests/tmpl/default.php's getnewfeerow)
// treats those as real selectable ticket types - which is exactly what
// this app's current EventTicket-per-override migration already does
// correctly for them. This fix touches ONLY the date-windowed entries.
//
// Verified: none of the 8 affected EventTicket rows (across 7 old
// event ids / 8 new Event rows) have any BookingItem referencing them, so
// this is a pure metadata correction - no bookings to reassign.
//
// For each: delete the wrongly-created discount EventTicket, and populate
// Event.eventTieredFees with the equivalent old-site discount definition,
// which EventBookingModal.tsx / backend bookingPrice.ts already know how
// to apply as a checkout-time price reduction within the given date
// window - matching old Matukio's actual discount behavior.

const mysql = require('mysql2/promise');

// { eventNumber (old hiron_matukio.id) -> { ticketName, tieredFee } }
// One entry per OLD event id; some old ids map to multiple new Event rows
// (repeated recurring dates), handled by matching on eventNumber below.
const FIXES = [
  {
    eventNumber: '678',
    ticketName: 'Frühbucher-Preis (bis 30.6.18)',
    tieredFee: { title: 'Frühbucher-Preis (bis 30.6.18)', value: 60, isPercentage: false, isDiscount: true, validFrom: null, validUntil: '2018-06-30T00:00:00.000Z' },
  },
  {
    eventNumber: '718',
    ticketName: 'inkl. Frühbucherrabatt (bis 31.12.2018)',
    tieredFee: { title: 'inkl. Frühbucherrabatt (bis 31.12.2018)', value: 40, isPercentage: false, isDiscount: true, validFrom: '2018-10-01T11:28:39.000Z', validUntil: '2018-12-31T11:28:41.000Z' },
  },
  {
    eventNumber: '825',
    ticketName: 'Frühbucherrabatt bis 30.6.2023',
    tieredFee: { title: 'Frühbucherrabatt bis 30.6.2023', value: 50, isPercentage: false, isDiscount: true, validFrom: '2023-05-31T00:00:00.000Z', validUntil: '2023-06-01T21:08:34.000Z' },
  },
  {
    eventNumber: '848',
    ticketName: 'Frühbucherrabatt bis 30.6.2024',
    tieredFee: { title: 'Frühbucherrabatt bis 30.6.2024', value: 50, isPercentage: false, isDiscount: true, validFrom: '2024-05-07T00:00:00.000Z', validUntil: '2024-06-30T00:00:00.000Z' },
  },
  {
    eventNumber: '870',
    ticketName: 'Frühbucherrabatt bis 30.6.2025',
    tieredFee: { title: 'Frühbucherrabatt bis 30.6.2025', value: 40, isPercentage: false, isDiscount: true, validFrom: '2025-06-10T00:00:00.000Z', validUntil: '2025-06-16T13:36:43.000Z' },
  },
  {
    eventNumber: '871',
    ticketName: 'Frühbucherrabatt',
    tieredFee: { title: 'Frühbucherrabatt', value: 40, isPercentage: false, isDiscount: true, validFrom: '2025-06-10T00:00:00.000Z', validUntil: '2025-06-16T13:36:18.000Z' },
  },
  {
    eventNumber: '890',
    ticketName: 'Frühbucherrabatt',
    tieredFee: { title: 'Frühbucherrabatt', value: 50, isPercentage: false, isDiscount: true, validFrom: '2026-05-28T15:23:40.000Z', validUntil: '2026-06-30T00:00:00.000Z' },
  },
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hirondelle_db',
    charset: 'utf8mb4',
  });

  const sqlStatements = [];
  let fixedEvents = 0;
  let deletedTickets = 0;

  for (const fix of FIXES) {
    const [events] = await conn.query(
      'SELECT id, title, eventTieredFees FROM Event WHERE eventNumber = ?',
      [fix.eventNumber]
    );

    for (const event of events) {
      const [tickets] = await conn.query(
        'SELECT id, name FROM EventTicket WHERE eventId = ? AND name = ?',
        [event.id, fix.ticketName]
      );
      if (tickets.length === 0) {
        console.warn(`No matching ticket "${fix.ticketName}" found for event ${event.id} (${event.title}, eventNumber ${fix.eventNumber}) - skipping.`);
        continue;
      }

      for (const ticket of tickets) {
        const [items] = await conn.query('SELECT id FROM BookingItem WHERE ticketId = ?', [ticket.id]);
        if (items.length > 0) {
          console.warn(`Ticket ${ticket.id} (${ticket.name}) on event ${event.id} has ${items.length} BookingItem row(s) - refusing to delete, skipping this ticket. Investigate manually.`);
          continue;
        }

        // mysql2 is inconsistent about this JSON column across rows in this
        // DB - some come back as the JS value null, others as the literal
        // string "null" (not real SQL NULL) - so a plain truthiness check
        // isn't enough; normalize both to an empty array explicitly.
        let existingTieredFees = [];
        if (event.eventTieredFees && event.eventTieredFees !== 'null') {
          const parsed = typeof event.eventTieredFees === 'string' ? JSON.parse(event.eventTieredFees) : event.eventTieredFees;
          if (Array.isArray(parsed)) existingTieredFees = parsed;
        }
        const newTieredFees = [...existingTieredFees, fix.tieredFee];
        const tieredFeesJson = JSON.stringify(newTieredFees).replace(/\\/g, '\\\\').replace(/'/g, "''");

        await conn.query(
          'UPDATE Event SET tieredFees = 1, eventTieredFees = ? WHERE id = ?',
          [JSON.stringify(newTieredFees), event.id]
        );
        sqlStatements.push(
          `UPDATE Event SET tieredFees = 1, eventTieredFees = '${tieredFeesJson}' WHERE id = '${event.id}';`
        );

        await conn.query('DELETE FROM EventTicket WHERE id = ?', [ticket.id]);
        sqlStatements.push(`DELETE FROM EventTicket WHERE id = '${ticket.id}';`);
        deletedTickets++;
        console.log(`Fixed event ${event.id} (${event.title}): moved "${ticket.name}" from EventTicket into eventTieredFees, deleted ticket ${ticket.id}.`);
      }
      fixedEvents++;
    }
  }

  console.log(`\nDone. Events touched: ${fixedEvents}, tickets removed: ${deletedTickets}.`);

  const fs = require('fs');
  const header = `-- Fix: move date-windowed "Frühbucherrabatt"-style discount override entries\n` +
    `-- out of EventTicket (where the migration wrongly created them as separate,\n` +
    `-- independently bookable tickets) and into Event.eventTieredFees (a proper\n` +
    `-- checkout-time discount, matching old Matukio's actual behavior for entries\n` +
    `-- that carry a real published_up/published_down validity window).\n` +
    `-- Verified locally: none of the affected tickets have any BookingItem rows,\n` +
    `-- so this is a pure metadata correction, nothing to reassign.\n` +
    `-- Generated ${new Date().toISOString()}.\n\n`;
  fs.writeFileSync(
    require('path').join(__dirname, 'fix_discount_tiered_fees_2026-09-20.sql'),
    header + sqlStatements.join('\n') + '\n'
  );
  console.log('Portable SQL written to scripts/fix_discount_tiered_fees_2026-09-20.sql');

  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
