import mysql from 'mysql2/promise';
import { prisma } from './src/utils/prisma';

// Scope of this migration (per explicit request):
//  - Newsletter subscribers: ALL real lists (excludes the disabled "Test Liste")
//  - Events: ONLY 2026 occurrences
//  - Bookings: only those tied to the migrated 2026 events (not the full 7000+ table)
const OLD_SITE_BASE_URL = 'https://www.fs-hirondelle.de/';

async function getOldConnection() {
  return mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'd03dbe51',
    charset: 'utf8mb4'
  });
}

function cleanText(value: any): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length ? str : null;
}

// Matukio's real event copy lives in `shortdesc` as HTML; the new frontend renders
// event.description as plain text (whitespace-pre-wrap), so strip tags/entities here.
function htmlToPlainText(html: any): string | null {
  const str = cleanText(html);
  if (!str) return null;
  const text = str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&uuml;/gi, 'ü').replace(/&Uuml;/g, 'Ü')
    .replace(/&auml;/gi, 'ä').replace(/&Auml;/g, 'Ä')
    .replace(/&ouml;/gi, 'ö').replace(/&Ouml;/g, 'Ö')
    .replace(/&szlig;/gi, 'ß')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text || null;
}

async function migrateLookups(conn: mysql.Connection) {
  console.log('\n--- Lookups: Currencies, Tax Rates, Locations, Organizers ---');

  // Currencies
  const [currencies] = await conn.query<any[]>('SELECT * FROM hiron_matukio_currencies');
  for (const c of currencies as any[]) {
    const existing = await prisma.currency.findFirst({ where: { paymentCode: c.payment_code } });
    if (!existing) {
      await prisma.currency.create({
        data: {
          description: c.title,
          symbol: c.sign,
          paymentCode: c.payment_code,
          symbolPosition: c.position === 1 ? 'Rechts' : 'Links',
          decimalChar: c.decimalsign || ',',
          published: !!c.published
        }
      });
    }
  }
  console.log(`Currencies: ${(currencies as any[]).length} checked`);

  // Tax rates
  const [taxes] = await conn.query<any[]>('SELECT * FROM hiron_matukio_taxes');
  const taxIdMap = new Map<number, string>();
  for (const t of taxes as any[]) {
    let rate = await prisma.taxRate.findFirst({ where: { title: t.title } });
    if (!rate) {
      rate = await prisma.taxRate.create({
        data: { title: t.title, value: parseFloat(t.value) || 0, published: !!t.published }
      });
    }
    taxIdMap.set(t.id, rate.title);
  }
  console.log(`Tax rates: ${(taxes as any[]).length} checked`);

  // Locations
  const [locations] = await conn.query<any[]>('SELECT * FROM hiron_matukio_locations');
  const locationIdMap = new Map<number, string>();
  for (const l of locations as any[]) {
    let loc = await prisma.location.findFirst({ where: { title: l.title } });
    if (!loc) {
      loc = await prisma.location.create({
        data: {
          title: l.title,
          googleMapsUrl: cleanText(l.gmaploc),
          latitude: l.lat ? parseFloat(l.lat) : null,
          longitude: l.lng ? parseFloat(l.lng) : null,
          phone: cleanText(l.phone),
          email: cleanText(l.email),
          website: cleanText(l.website),
          imageUrl: l.image ? OLD_SITE_BASE_URL + l.image : null,
          description: cleanText(l.location),
          comments: cleanText(l.comments),
          published: !!l.published
        }
      });
    }
    locationIdMap.set(l.id, loc.id);
  }
  console.log(`Locations: ${(locations as any[]).length} checked`);

  // Organizers
  const [organizers] = await conn.query<any[]>('SELECT * FROM hiron_matukio_organizers');
  const organizerUserIdMap = new Map<number, string>();
  for (const o of organizers as any[]) {
    let org = await prisma.organizer.findFirst({ where: { email: o.email } });
    if (!org) {
      org = await prisma.organizer.create({
        data: {
          name: o.name,
          email: cleanText(o.email),
          website: cleanText(o.website),
          phone: cleanText(o.phone),
          imageUrl: o.image ? OLD_SITE_BASE_URL + o.image : null,
          description: cleanText(o.description),
          comments: cleanText(o.comments),
          published: !!o.published
        }
      });
    }
    organizerUserIdMap.set(o.userId, org.id);
  }
  console.log(`Organizers: ${(organizers as any[]).length} checked`);

  return { taxIdMap, locationIdMap, organizerUserIdMap };
}

async function migrateSubscribers(conn: mysql.Connection) {
  console.log('\n--- Newsletter Subscribers ---');

  const LIST_MAP: Record<number, string> = { 1: 'GENERAL', 2: 'NEWSLETTER', 8: 'TANDEM' };

  const [rows] = await conn.query<any[]>(`
    SELECT u.email, u.name, u.creation_date, u.active, u.confirmed, u.language, u.tracking,
           l.list_id, l.status, l.subscription_date
    FROM hiron_acym_user_has_list l
    JOIN hiron_acym_user u ON u.id = l.user_id
    WHERE l.list_id IN (1, 2, 8)
  `);

  let count = 0;
  for (const row of rows as any[]) {
    const listType = LIST_MAP[row.list_id];
    if (!listType || !row.email) continue;

    const email = String(row.email).toLowerCase().trim();
    const subscribedAt = row.subscription_date && row.subscription_date.getFullYear() > 1970
      ? row.subscription_date
      : (row.creation_date || new Date());

    await prisma.newsletter.upsert({
      where: { email_listType: { email, listType } },
      create: {
        email,
        name: cleanText(row.name),
        listType,
        isActive: row.status === 1 && row.active === 1,
        isConfirmed: row.confirmed === 1,
        subscribedAt,
        language: row.language === 'de-DE' ? 'German' : (row.language || 'German'),
        trackStatus: row.tracking === 1
      },
      update: {
        name: cleanText(row.name),
        isActive: row.status === 1 && row.active === 1,
        isConfirmed: row.confirmed === 1
      }
    });
    count++;
  }
  console.log(`Subscribers migrated: ${count}`);
}

async function migrateEventsAndBookings(
  conn: mysql.Connection,
  lookups: { taxIdMap: Map<number, string>; locationIdMap: Map<number, string>; organizerUserIdMap: Map<number, string> }
) {
  console.log('\n--- Events (2026 only) ---');

  const categories = await prisma.category.findMany();
  const categoryTitleMap = new Map(categories.map(c => [c.title, c.id]));

  const [oldCategories] = await conn.query<any[]>(`SELECT id, title FROM hiron_categories WHERE extension = 'com_matukio'`);
  const oldCatIdToTitle = new Map((oldCategories as any[]).map(c => [c.id, c.title]));

  const [rows] = await conn.query<any[]>(`
    SELECT m.*, r.id as recurring_id, r.begin, r.end, r.override_title, r.override_maxpupil, r.override_place_id, r.cancelled, r.published as recurring_published
    FROM hiron_matukio_recurring r
    JOIN hiron_matukio m ON m.id = r.event_id
    WHERE r.begin BETWEEN '2026-01-01' AND '2026-12-31 23:59:59'
    ORDER BY r.begin ASC
  `);

  const recurringIdToNewEventId = new Map<number, string>();
  // Per event: the fee-tier plan derived from Matukio's different_fees_override JSON,
  // keyed by the same "type" index Matukio stores on each booking (0 = base/"Normal").
  const eventTierPlans = new Map<string, { typeIndex: string; name: string; price: number }[]>();

  for (const row of rows as any[]) {
    const alias = `${row.alias}-${row.recurring_id}`;
    const categoryTitle = oldCatIdToTitle.get(row.catid);
    const categoryId = categoryTitle ? categoryTitleMap.get(categoryTitle) : undefined;
    const placeId = row.override_place_id || row.place_id;
    const locationId = placeId ? lookups.locationIdMap.get(placeId) : undefined;
    const organizerId = lookups.organizerUserIdMap.get(row.publisher);
    const taxRateTitle = lookups.taxIdMap.get(row.tax_id);

    const fee = parseFloat(row.fees) || 0;

    const existing = await prisma.event.findUnique({ where: { alias } });
    const eventData = {
      title: row.override_title || row.title,
      category: categoryTitle || null,
      categoryId: categoryId || null,
      description: htmlToPlainText(row.description) || htmlToPlainText(row.shortdesc),
      shortDescription: htmlToPlainText(row.shortdesc),
      startDate: row.begin,
      endDate: row.end,
      location: cleanText(row.place),
      locationId: locationId || null,
      locationType: locationId ? 'preset' : 'custom',
      googleMapsAddress: null,
      capacity: row.override_maxpupil || row.maxpupil || 20,
      maxParticipants: row.override_maxpupil || row.maxpupil || null,
      minParticipants: row.minpupil || 0,
      // NOTE: Matukio's per-event calendar_bgcolor/fontcolor is NOT what the live
      // site's calendar grid actually renders (verified against fs-hirondelle.de) -
      // the live calendar uses a fixed per-CATEGORY palette instead. Leave `color`/
      // `calendarTextColor` unset so the frontend's categoryColors lookup (already
      // matching the live site) applies instead of this misleading per-event value.
      color: null,
      calendarBgColor: row.calendar_bgcolor || '#3a87ac',
      calendarTextColor: null,
      imageUrl: row.image ? OLD_SITE_BASE_URL + row.image : null,
      organizer: 'Flugschule Hirondelle',
      organizerId: organizerId || null,
      registrationDeadline: null,
      feePerPerson: fee,
      currency: 'EUR',
      eventType: fee > 0 ? 'paid' : 'free',
      taxRate: taxRateTitle || null,
      isHotEvent: !!row.hot_event,
      isTopEvent: !!row.top_event,
      published: !!row.published && !row.cancelled && !!row.recurring_published,
      paymentProcessing: !!row.payment_processing,
      tieredFees: !!row.different_fees,
      customBookingEmail: cleanText(row.booking_mail),
      metaDescription: cleanText(row.meta_description),
      metaKeywords: cleanText(row.meta_keywords),
      eventNumber: String(row.id),
      seriesId: `matukio-${row.id}`
    };

    const event = existing
      ? await prisma.event.update({ where: { id: existing.id }, data: eventData })
      : await prisma.event.create({ data: { ...eventData, alias } });

    recurringIdToNewEventId.set(row.recurring_id, event.id);

    // Build the fee-tier plan for this event: "0" = base/"Normal", "1".."N" = each
    // override entry (Matukio applies overrides as +/- amount or % off the base fee).
    const tiers: { typeIndex: string; name: string; price: number }[] = [{ typeIndex: '0', name: 'Normal', price: fee }];
    if (row.different_fees && row.different_fees_override) {
      try {
        const overrides = JSON.parse(row.different_fees_override);
        for (const o of overrides as any[]) {
          const value = parseFloat(o.value) || 0;
          const isPercent = o.percent === true || o.percent === 'true' || o.percent === 1;
          const isDiscount = o.discount === true || o.discount === 'true' || o.discount === 1;
          let price = fee;
          if (isPercent) price = isDiscount ? fee * (1 - value / 100) : fee * (1 + value / 100);
          else price = isDiscount ? fee - value : fee + value;
          tiers.push({ typeIndex: String(o.id), name: htmlToPlainText(o.title) || `Option ${o.id}`, price: Math.round(price * 100) / 100 });
        }
      } catch (e) {
        console.warn(`Could not parse different_fees_override for event ${row.id}:`, e);
      }
    }
    eventTierPlans.set(event.id, tiers);
  }
  console.log(`Events migrated: ${recurringIdToNewEventId.size}`);

  console.log('\n--- Bookings (tied to migrated 2026 events) ---');

  const STATUS_MAP: Record<number, any> = { 0: 'PENDING', 1: 'CONFIRMED', 2: 'WAITLIST', 4: 'COMPLETED' };

  let bookingCount = 0;
  for (const [oldRecurringId, newEventId] of recurringIdToNewEventId) {
    const event = await prisma.event.findUnique({ where: { id: newEventId } });
    const tierPlan = eventTierPlans.get(newEventId) || [{ typeIndex: '0', name: 'Standard', price: event?.feePerPerson || 0 }];
    const isTiered = tierPlan.length > 1;

    // Tiered events: wipe and rebuild bookings+tickets each run so ticket tiers and
    // per-tier booking counts always match Matukio's different_fees_override exactly.
    if (isTiered) {
      await prisma.booking.deleteMany({ where: { eventId: newEventId } });
      await prisma.eventTicket.deleteMany({ where: { eventId: newEventId } });
    }

    const ticketByType = new Map<string, string>();
    for (const tier of tierPlan) {
      let ticket = await prisma.eventTicket.findFirst({ where: { eventId: newEventId, name: tier.name } });
      if (!ticket) {
        ticket = await prisma.eventTicket.create({
          data: { eventId: newEventId, name: tier.name, price: tier.price, capacity: event?.capacity || 20 }
        });
      }
      ticketByType.set(tier.typeIndex, ticket.id);
    }
    const baseTicketId = ticketByType.get('0')!;

    const [bookingRows] = await conn.query<any[]>(
      'SELECT * FROM hiron_matukio_bookings WHERE semid = ?',
      [oldRecurringId]
    );

    for (const b of bookingRows as any[]) {
      if (!isTiered) {
        const alreadyMigrated = await prisma.booking.findFirst({
          where: { eventId: newEventId, customerDetails: { path: ['oldBookingId'], equals: b.id } }
        });
        if (alreadyMigrated) continue;
      }

      // Tally how many people booked each fee-tier ("types" is 0-indexed into the
      // event's tier plan: "0" = Normal/base, "1".."N" = override entries).
      const typeCounts = new Map<string, number>();
      try {
        const parsed = b.different_fees ? JSON.parse(b.different_fees) : null;
        const types: string[] = parsed?.types || [];
        for (const t of types) {
          const ticketId = ticketByType.get(String(t));
          if (ticketId) typeCounts.set(ticketId, (typeCounts.get(ticketId) || 0) + 1);
        }
      } catch {
        // fall through to default below
      }
      if (typeCounts.size === 0) {
        typeCounts.set(baseTicketId, b.nrbooked || 1);
      }

      const totalPrice = parseFloat(b.payment_brutto) || 0;
      await prisma.booking.create({
        data: {
          eventId: newEventId,
          status: STATUS_MAP[b.status] || 'PENDING',
          totalPrice,
          paymentMethod: cleanText(b.payment_method),
          remarks: cleanText(b.comment),
          createdAt: b.bookingdate && b.bookingdate.getFullYear() > 1970 ? b.bookingdate : new Date(),
          customerDetails: {
            name: cleanText(b.name),
            email: cleanText(b.email),
            language: cleanText(b.language),
            paid: !!b.paid,
            checkedIn: !!b.checked_in,
            source: 'migrated_from_matukio',
            oldBookingId: b.id
          },
          items: {
            create: Array.from(typeCounts.entries()).map(([ticketId, quantity]) => ({ ticketId, quantity }))
          }
        }
      });
      bookingCount++;
    }
  }
  console.log(`Bookings migrated: ${bookingCount}`);
}

async function main() {
  const conn = await getOldConnection();
  try {
    const lookups = await migrateLookups(conn);
    await migrateSubscribers(conn);
    await migrateEventsAndBookings(conn, lookups);
    console.log('\nMigration complete.');
  } finally {
    await conn.end();
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
