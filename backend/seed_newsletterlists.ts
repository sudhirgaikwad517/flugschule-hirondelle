import { prisma } from './src/utils/prisma';

// Matches hiron_acym_list exactly: id 1, 2, 8 (id 13 "Test Liste" was inactive/unused, skipped)
const LISTS = [
  { code: 'GENERAL', name: 'Allgemeiner Newsletter', color: '#3366ff' },
  { code: 'NEWSLETTER', name: 'Newsletter', color: '#ECE649' },
  { code: 'TANDEM', name: 'Tandemflüge Newsletter', color: '#000000' }
];

async function main() {
  for (const list of LISTS) {
    await prisma.newsletterList.upsert({
      where: { code: list.code },
      create: { ...list, visible: true, active: true },
      update: { name: list.name, color: list.color }
    });
  }
  console.log('Newsletter lists seeded.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
