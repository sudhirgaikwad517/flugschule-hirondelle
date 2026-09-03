import { prisma } from './prisma';

async function main() {
  await prisma.event.create({
    data: {
      title: 'Tandem Paragliding',
      description: 'Erleben Sie die Freiheit des Fliegens bei einem Tandemflug. (Experience the freedom of flying with a tandem flight).',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
      feePerPerson: 150,
      maxParticipants: 10,
    },
  });
  console.log('Dummy event created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
