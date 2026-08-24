import { prisma } from './src/utils/prisma';

async function main() {
  const event = await prisma.event.create({
    data: {
      title: "TENERIFFA: THERMIK/SOARING",
      category: "Reisen",
      description: "Fliegend den Sommer verlängern auf der größten der kanarischen Inseln: Teneriffa.\n\n- Zusätzliche Kosten: Hin- und Rückflug nach Teneriffa, Unterkunft, Verpflegung\n\nDie Buchung der Flüge für die gemeinsame Anreise sowie Übernachtung vermitteln wir euch über unser beauftragtes Reisebüro.\n\nWeiter Infos folgen...",
      startDate: new Date("2026-12-06T08:00:00.000Z"),
      endDate: new Date("2026-12-13T15:00:00.000Z"),
      registrationDeadline: new Date("2026-12-05T17:00:00.000Z"),
      color: "#488ac7",
      location: "Teneriffa",
      organizer: "Alexander Schlink",
      capacity: 26,
      maxParticipants: 26,
      imageUrl: "https://images.pexels.com/photos/2873926/pexels-photo-2873926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      tickets: {
        create: [
          {
            name: "Gebühren pro Person",
            price: 950.00,
            description: "Teilnahmegebühr für Teneriffa Tour"
          }
        ]
      }
    }
  });
  console.log("Created event:", event);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
