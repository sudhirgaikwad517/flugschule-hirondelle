import { prisma } from './src/utils/prisma';

async function main() {
  await prisma.event.updateMany({
    where: { title: "Kolumbien-Tour" },
    data: { imageUrl: "/kolumbien-tour.jpg" }
  });
  console.log("Image updated to local path!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
