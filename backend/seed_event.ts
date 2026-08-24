import { prisma } from './src/utils/prisma';

async function main() {
  const event = await prisma.event.create({
    data: {
      title: 'RETTUNGSGERÄTE SEMINAR',
      category: 'Performance',
      description: 'Sicher in allen Situationen... Ein Muss für jeden Gleitschirm- und Drachenpiloten ist ein Rettungsgerätewurftraining mit der eigenen Ausrüstung in der Sporthalle. Ebenso ist das Training für die B-Scheinpraxisausbildung vorgeschrieben. Im Anschluss wird die Rettung wieder neu gepackt und eure Ausrüstung ist wieder fit für die nächsten Flüge!\n\nWichtig: Bitte Rettungsgeräte, die nicht bei uns gekauft wurden, bei eurer Buchung in der Bemerkung eintragen mit Hersteller / Typ, damit wir vorab klären können, ob wir diese im Kurs packen können.',
      startDate: new Date('2026-02-14T10:00:00Z'),
      endDate: new Date('2026-02-14T15:00:00Z'),
      location: 'Schulstraße 5, 69469 Weinheim',
      capacity: 26,
      maxParticipants: 26,
      color: '#3a87ad',
      registrationDeadline: new Date('2026-02-13T17:00:00Z'),
      organizer: 'Alexander Schlink',
      tickets: {
        create: [
          {
            name: 'Gebühren',
            price: 85.00,
            capacity: 26,
            description: 'Gebühren pro Person'
          }
        ]
      }
    }
  });

  console.log('Event created:', event.title);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
