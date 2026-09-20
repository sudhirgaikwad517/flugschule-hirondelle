// Resets BookingFormConfig.steps to match the live booking form
// (EventBookingModal.tsx step 1) exactly - field ids, labels, order, and
// required status. The previous seed data (firstName/lastName split,
// combined address+city fields, a "ticketType"/"equipment" step) didn't
// match the real, working form at all: salutation/birthDate/sizeWeight
// weren't present, and the field ids that WERE there (firstName, address)
// don't correspond to anything the backend/CSV export/admin display
// actually reads (fullName, street). Wiring the builder to the live form
// without first fixing this would have been a real regression.
//
// This only covers the 9 standard personal-detail fields (step 1,
// "Anmeldung"). Ticket selection and payment method already have their
// own dedicated, working systems (EventTicket/extraFeeOptions, PaymentMethod)
// and aren't part of this config. Admin-added brand-new custom fields
// already have their own separate, working mechanism (Benutzerdefinierte
// Felder / CustomField model) - this builder intentionally does not
// duplicate that.
//
// Usage: node scripts/reset_booking_form_config_2026-09-20.js

require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const STEPS = [
  {
    id: 'step-1',
    title: 'Anmeldung',
    fields: [
      { id: 'salutation', type: 'select', label: 'Anrede', required: true },
      { id: 'fullName', type: 'text', label: 'Vorname Nachname', required: true },
      { id: 'birthDate', type: 'text', label: 'Geburtsdatum', required: true },
      { id: 'sizeWeight', type: 'text', label: 'Größe in cm / Gewicht in kg', required: true },
      { id: 'phone', type: 'text', label: 'Telefon / Mobil', required: true },
      { id: 'email', type: 'email', label: 'E-Mail', required: true },
      { id: 'street', type: 'text', label: 'Straße', required: true },
      { id: 'zip', type: 'text', label: 'Postleitzahl', required: true },
      { id: 'city', type: 'text', label: 'Ort', required: true },
    ],
  },
];

(async () => {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter });

  await prisma.bookingFormConfig.upsert({
    where: { id: 'default' },
    update: { steps: STEPS },
    create: { id: 'default', steps: STEPS },
  });
  console.log('BookingFormConfig reset to match the live form.');

  await prisma.$disconnect();
})();
