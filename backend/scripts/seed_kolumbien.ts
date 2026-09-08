import { prisma } from './src/utils/prisma';

async function main() {
  const event = await prisma.event.create({
    data: {
      title: "Kolumbien-Tour",
      category: "Reisen",
      description: "Wir fliegen über den grünen Landschaften des Valle del Cauca. Dabei genießen wir die großartige Gastfreundschaft der Kolumbianer und befliegen über mehrere Stationen die besten Fluggebiete von Cali Richtung Medellin.\n\n- Im Tourpreis enthalten: Übernachtung im Doppelzimmer inkl. Frühstück, Transfers und Auffahrten vor Ort\n- Zusätzliche Kosten: Hin- und Rückflug nach Kolumbien, Verpflegung\n\nDie Flugverbindung für die gemeinsame Anreise teilen wir euch nach Buchung mit.\n\nHinweis CORONA:\nWir empfehlen dringend den Abschluss einer Reiserücktritts- sowie einer Auslandskrankenversicherung.",
      startDate: new Date("2026-01-24T08:00:00.000Z"),
      endDate: new Date("2026-02-07T15:00:00.000Z"),
      registrationDeadline: new Date("2026-01-23T17:00:00.000Z"),
      color: "#488ac7",
      location: "Kolumbien",
      organizer: "Alexander Schlink",
      capacity: 26,
      maxParticipants: 26,
      imageUrl: "https://images.unsplash.com/photo-1522081122602-23cbf9ba517b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      tickets: {
        create: [
          {
            name: "Standard Ticket",
            price: 2390.00,
            description: "Komplettpreis für die Tour"
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
