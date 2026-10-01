const { prisma } = require('./dist/utils/prisma');

async function main() {
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    console.log(`Category: ${cat.title}, imageUrl: ${cat.imageUrl}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
