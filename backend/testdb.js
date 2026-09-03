const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.templatesConfig.findUnique({where: {id: 'default'}});
  console.log(config);
}
main().finally(() => process.exit());
