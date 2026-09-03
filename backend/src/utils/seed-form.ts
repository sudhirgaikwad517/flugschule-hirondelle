import { prisma } from './prisma';

async function main() {
  const steps = [
    {
      id: 'step-1',
      title: 'Anmeldung (Registration)',
      fields: [
        {
          id: 'firstName',
          label: 'Vorname',
          type: 'text',
          required: true,
          priceModifier: 0,
          isTicket: false,
          perTicket: false,
          linkedToPerson: 1
        },
        {
          id: 'lastName',
          label: 'Nachname',
          type: 'text',
          required: true,
          priceModifier: 0,
          isTicket: false,
          perTicket: false,
          linkedToPerson: 1
        },
        {
          id: 'email',
          label: 'E-Mail',
          type: 'email',
          required: true,
          priceModifier: 0,
          isTicket: false,
          perTicket: false,
          linkedToPerson: 1
        },
        {
          id: 'phone',
          label: 'Telefon',
          type: 'text',
          required: true,
          priceModifier: 0,
          isTicket: false,
          perTicket: false,
          linkedToPerson: 1
        },
        {
          id: 'address',
          label: 'Straße & Hausnummer',
          type: 'text',
          required: true,
          priceModifier: 0,
          isTicket: false,
          perTicket: false,
          linkedToPerson: 1
        },
        {
          id: 'city',
          label: 'PLZ & Ort',
          type: 'text',
          required: true,
          priceModifier: 0,
          isTicket: false,
          perTicket: false,
          linkedToPerson: 1
        }
      ]
    },
    {
      id: 'step-2',
      title: 'Tickets & Optionen',
      fields: [
        {
          id: 'ticketType',
          label: 'Ticket Auswahl',
          type: 'select',
          required: true,
          priceModifier: 0,
          isTicket: true,
          perTicket: false,
          linkedToPerson: 0
        },
        {
          id: 'equipment',
          label: 'Leihausrüstung benötigt?',
          type: 'checkbox',
          required: false,
          priceModifier: 50,
          isTicket: false,
          perTicket: true,
          linkedToPerson: 0
        }
      ]
    },
    {
      id: 'step-3',
      title: 'Bezahlung (Payment)',
      fields: [
        {
          id: 'paymentMethod',
          label: 'Zahlungsmethode',
          type: 'select',
          required: true,
          priceModifier: 0,
          isTicket: false,
          perTicket: false,
          linkedToPerson: 0
        }
      ]
    }
  ];

  await prisma.bookingFormConfig.upsert({
    where: { id: 'default' },
    update: { steps },
    create: { id: 'default', steps }
  });

  console.log('Booking form config seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
