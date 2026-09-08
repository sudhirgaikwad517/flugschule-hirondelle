import { prisma } from './src/utils/prisma';
async function main() {
  await prisma.event.updateMany({
    where: { title: 'RETTUNGSGERÄTE SEMINAR' },
    data: { category: 'Rettungsgerätetraining' }
  });
  console.log('Fixed category');
}
main();
