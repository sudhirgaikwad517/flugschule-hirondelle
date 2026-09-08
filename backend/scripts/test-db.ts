import { prisma } from './src/utils/prisma';
async function main() {
  const count = await prisma.newsletter.count();
  console.log('Subscriber count:', count);
}
main().catch(console.error).finally(() => process.exit(0));
