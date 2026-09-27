// Production's "default" TemplatesConfig.emails row was created before
// userCancellation/adminCancellation/newEvent/freePlacesReminder existed in
// this codebase - it only ever had waitingList/bookingConfirmation, so the
// admin's "Buchungskündigungs E-Mail" (and 3 others) showed genuinely empty,
// not a display bug. This MERGES in the missing sub-templates (real content,
// matching what the GET route's own create-if-missing defaults now contain)
// without touching whatever's already there - safe to run on an environment
// that already has all 6 (a no-op) or one that's missing all/some of them.
//
// Usage: node scripts/backfill_missing_email_templates_2026-09-27.js

require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const REAL_DEFAULTS = {
  userCancellation: {
    subject: 'Stornierungsbestätigung: {EVENT_TITLE}',
    bodyHtml: '<h3>Hallo {BOOKING_NAME},</h3><p>Sie haben Ihre Buchung storniert - Ihr Platz wurde freigegeben.</p><p>{EVENT_DETAILS}</p><br/><p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>',
    bodyText: 'Hallo {BOOKING_NAME}, Sie haben Ihre Buchung storniert - Ihr Platz wurde freigegeben. {EVENT_DETAILS}',
  },
  adminCancellation: {
    subject: 'Stornierung Ihrer Buchung: {EVENT_TITLE}',
    bodyHtml: '<h3>Hallo {BOOKING_NAME},</h3><p>Ihre Buchung für <strong>{EVENT_TITLE}</strong> wurde storniert. Ihre Buchung ist daher nicht mehr gültig.</p><p>{EVENT_DETAILS}</p><br/><p>Bei Fragen kontaktieren Sie uns gerne direkt.</p><p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>',
    bodyText: 'Hallo {BOOKING_NAME}, Ihre Buchung für {EVENT_TITLE} wurde storniert. Ihre Buchung ist daher nicht mehr gültig. {EVENT_DETAILS}',
  },
  newEvent: {
    subject: 'Neue Veranstaltung: {EVENT_TITLE}',
    bodyHtml: '\n          <h3>Hallo {USER_NAME},</h3>\n          <p>es gibt eine neue Veranstaltung bei der Flugschule Hirondelle:</p>\n          <br/>\n          {EVENT_DETAILS}\n          <br/>\n          <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>\n        ',
  },
  freePlacesReminder: {
    subject: 'Noch freie Plätze: {EVENT_TITLE}',
    bodyHtml: '\n          <h3>Hallo {USER_NAME},</h3>\n          <p>für folgende Veranstaltung sind noch Plätze frei:</p>\n          <br/>\n          {EVENT_DETAILS}\n          <br/>\n          <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>\n        ',
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
  const missing = Object.keys(REAL_DEFAULTS).filter((key) => !currentEmails[key]);

  if (missing.length === 0) {
    console.log('All 6 email templates already present - nothing to do.');
    await prisma.$disconnect();
    return;
  }

  const mergedEmails = { ...currentEmails };
  for (const key of missing) mergedEmails[key] = REAL_DEFAULTS[key];

  await prisma.templatesConfig.update({
    where: { id: 'default' },
    data: { emails: mergedEmails },
  });

  console.log('Added missing email templates:', missing.join(', '));
  await prisma.$disconnect();
})();
