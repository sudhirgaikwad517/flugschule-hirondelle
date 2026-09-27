// The "default" TemplatesConfig.emails row (both locally and on production)
// had generic placeholder subject/body text for bookingConfirmation/
// adminCancellation/userCancellation, and was missing newEvent/
// freePlacesReminder entirely - none of it matched old Matukio's real,
// word-for-word content (bank details, insurance recommendation, waitlist
// policy, resolved ##LANG_KEY## text). This OVERWRITES those 5 keys with
// the real content (same as templatesConfig.routes.ts's own GET-route
// defaults), leaving waitingList untouched.
//
// Usage: node scripts/backfill_real_email_content_2026-09-27.js

require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const REAL_CONTENT = {
  bookingConfirmation: {
    subject: 'Buchungsbestätigung: {EVENT_TITLE}',
    bodyHtml: '<h3>Hallo {BOOKING_NAME},</h3><p>vielen Dank für Ihre Buchung.</p><br/>{EVENT_DETAILS}<br/>{BOOKING_DETAILS}<br/><p>Im Anhang finden Sie Ihre Rechnung und Ihr Ticket.</p><hr/><p>Die Kursgebühr wird 4 Wochen vor Kursbeginn fällig. Bei Kurzfristbuchungen (ab vier Wochen vor Kursbeginn) wird der gesamte Kurspreis sofort fällig.</p><p>Wir führen eine echte Warteliste (der Kurs ist dann tatsächlich ausgebucht). Buchungen auf Warteliste sind daher erst zu bezahlen, wenn die Teilnahme auch sicher - und der Platz verbindlich bestätigt ist.</p><p><strong>Bankverbindung</strong><br/>Kontoinhaber: Alexander Schlink<br/>Sparkasse Südpfalz<br/>IBAN: DE32 5485 0010 1700 1976 41<br/>BIC: SOLADES1SUW</p><hr/><p style="color: #ff0000;">Wir empfehlen zur Absicherung für Stornos / Absagen den Abschluss einer Seminarversicherung bzw. für unsere mehrtätigen Kurse / Reisen zusätzlich eine Reiseversicherung. Infos dazu findet ihr auf unserer Seite <a href="https://www.fs-hirondelle.de/infos/versicherungen" style="color: #ff0000;">https://www.fs-hirondelle.de/infos/versicherungen</a>.</p><hr/><p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>',
    bodyText: 'Hallo {BOOKING_NAME},\n\nvielen Dank für Ihre Buchung.\n\n{EVENT_DETAILS}\n\n{BOOKING_DETAILS}\n\nIm Anhang finden Sie Ihre Rechnung und Ihr Ticket.\n\nDie Kursgebühr wird 4 Wochen vor Kursbeginn fällig. Bei Kurzfristbuchungen (ab vier Wochen vor Kursbeginn) wird der gesamte Kurspreis sofort fällig.\n\nWir führen eine echte Warteliste (der Kurs ist dann tatsächlich ausgebucht). Buchungen auf Warteliste sind daher erst zu bezahlen, wenn die Teilnahme auch sicher - und der Platz verbindlich bestätigt ist.\n\nBankverbindung\nKontoinhaber: Alexander Schlink\nSparkasse Südpfalz\nIBAN: DE32 5485 0010 1700 1976 41\nBIC: SOLADES1SUW\n\nWir empfehlen zur Absicherung für Stornos / Absagen den Abschluss einer Seminarversicherung bzw. für unsere mehrtätigen Kurse / Reisen zusätzlich eine Reiseversicherung. Infos dazu findet ihr auf unserer Seite https://www.fs-hirondelle.de/infos/versicherungen.\n\nMit freundlichen Grüßen,\nIhr Team der Flugschule Hirondelle'
  },
  adminCancellation: {
    subject: 'Stornierung Ihrer Buchung: {EVENT_TITLE}',
    bodyHtml: '<p>Sehr geehrte/geehrter {BOOKING_NAME},</p><p>Folgende Buchung wurde storniert:</p><p>{EVENT_DETAILS}</p><p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>',
    bodyText: 'Sehr geehrte/geehrter {BOOKING_NAME},\n\nFolgende Buchung wurde storniert:\n{EVENT_DETAILS}\n\nMit freundlichen Grüßen,\nIhr Team der Flugschule Hirondelle'
  },
  userCancellation: {
    subject: 'Stornierungsbestätigung: {EVENT_TITLE}',
    bodyHtml: '<p>Sehr geehrte/geehrter {BOOKING_NAME},</p><p>Sie haben Ihre Buchung storniert - Ihr Platz wurde freigegeben.</p><p><strong>Buchungsdetails:</strong></p><p>{EVENT_DETAILS}</p><p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>',
    bodyText: 'Sehr geehrte/geehrter {BOOKING_NAME},\n\nSie haben Ihre Buchung storniert - Ihr Platz wurde freigegeben.\n\nBuchungsdetails:\n{EVENT_DETAILS}\n\nMit freundlichen Grüßen,\nIhr Team der Flugschule Hirondelle'
  },
  newEvent: {
    subject: 'New event: {EVENT_TITLE}',
    bodyHtml: '<p>Sehr geehrte/geehrter {USER_NAME},</p><p>Eine neue Veranstaltung wurde erstellt!</p><p><strong>Mehr Informationen:</strong></p><p>{EVENT_DETAILS}</p><p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>'
  },
  freePlacesReminder: {
    subject: 'Reminder free places: {EVENT_TITLE}',
    bodyHtml: '<p>Sehr geehrte/geehrter {USER_NAME},</p><p>Für die folgende Veranstaltung sind noch Plätze verfügbar!</p><p><strong>Mehr Informationen:</strong></p><p>{EVENT_DETAILS}</p><p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>'
  },
};

(async () => {
  const existing = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
  if (!existing) {
    console.log('No existing "default" row - nothing to backfill.');
    await prisma.$disconnect();
    return;
  }

  const currentEmails = (existing.emails && typeof existing.emails === 'object') ? existing.emails : {};
  console.log('Before:', JSON.stringify({
    bookingConfirmation: currentEmails.bookingConfirmation,
    adminCancellation: currentEmails.adminCancellation,
    userCancellation: currentEmails.userCancellation,
    newEvent: currentEmails.newEvent,
    freePlacesReminder: currentEmails.freePlacesReminder,
  }));

  const mergedEmails = { ...currentEmails, ...REAL_CONTENT };

  await prisma.templatesConfig.update({
    where: { id: 'default' },
    data: { emails: mergedEmails },
  });

  console.log('Overwrote bookingConfirmation/adminCancellation/userCancellation/newEvent/freePlacesReminder with old\'s real content.');
  await prisma.$disconnect();
})();
