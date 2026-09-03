const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const defaultTemplates = {
    bookingConfirmation: {
      subject: 'Buchungsbestätigung: {EVENT_TITLE}',
      bodyHtml: `
        <h3>Hallo {BOOKING_NAME},</h3>
        <p>vielen Dank für Ihre Buchung bei der Flugschule Hirondelle.</p>
        <p>Ihre Buchung wurde erfolgreich bestätigt. Im Anhang finden Sie Ihre Rechnung sowie Ihr Ticket.</p>
        <br/>
        <h4>Event Details:</h4>
        <p>{EVENT_DETAILS}</p>
        <br/>
        <h4>Buchungsübersicht:</h4>
        <p>{BOOKING_DETAILS}</p>
        <br/>
        <p>Wir freuen uns auf Ihre Teilnahme!</p>
        <br/>
        <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>
      `
    },
    waitingList: {
      subject: 'Wartelistenplatz: {EVENT_TITLE}',
      bodyHtml: `
        <h3>Hallo {BOOKING_NAME},</h3>
        <p>vielen Dank für Ihr Interesse an <strong>{EVENT_TITLE}</strong>.</p>
        <p>Da die Veranstaltung derzeit ausgebucht ist, haben wir Sie auf die Warteliste gesetzt.</p>
        <p>Sobald ein Platz frei wird, werden wir Sie umgehend informieren.</p>
        <br/>
        <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>
      `
    }
  };

  const existing = await prisma.templatesConfig.findUnique({
    where: { id: 'default' }
  });

  if (existing) {
    await prisma.templatesConfig.update({
      where: { id: 'default' },
      data: { emails: defaultTemplates }
    });
    console.log('Updated existing default template config in database.');
  } else {
    await prisma.templatesConfig.create({
      data: {
        id: 'default',
        emails: defaultTemplates,
        invoices: {},
        tickets: {}
      }
    });
    console.log('Created default template config in database.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
