// Seeds TemplatesConfig.emails.newEvent and .freePlacesReminder with
// starting content, matching old Matukio's real mail_newevent /
// mail_cron_reminder template structure (both were generic - no unique
// business content like mail_booking's bank details - so this is a
// reasonable German rewrite of the structure, not old's exact text, which
// itself had two untranslated JText placeholders with no defined string).
// Added because a full admin audit found these two email types had no
// equivalent anywhere in the new app.
//
// Usage: node scripts/seed_new_event_and_reminder_templates_2026-09-20.js

require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

(async () => {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter });

  const config = await prisma.templatesConfig.findUnique({ where: { id: 'default' } });
  if (!config) {
    console.error('No TemplatesConfig row with id="default" found.');
    await prisma.$disconnect();
    return;
  }

  const emails = { ...config.emails };

  if (!emails.newEvent) {
    emails.newEvent = {
      subject: 'Neue Veranstaltung: {EVENT_TITLE}',
      bodyHtml: `
          <h3>Hallo {USER_NAME},</h3>
          <p>es gibt eine neue Veranstaltung bei der Flugschule Hirondelle:</p>
          <br/>
          {EVENT_DETAILS}
          <br/>
          <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>
        `,
    };
  }

  if (!emails.freePlacesReminder) {
    emails.freePlacesReminder = {
      subject: 'Noch freie Plätze: {EVENT_TITLE}',
      bodyHtml: `
          <h3>Hallo {USER_NAME},</h3>
          <p>für folgende Veranstaltung sind noch Plätze frei:</p>
          <br/>
          {EVENT_DETAILS}
          <br/>
          <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>
        `,
    };
  }

  await prisma.templatesConfig.update({ where: { id: 'default' }, data: { emails } });
  console.log('Seeded emails.newEvent and emails.freePlacesReminder.');

  await prisma.$disconnect();
})();
