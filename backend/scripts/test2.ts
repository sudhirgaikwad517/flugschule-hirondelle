import { prisma } from './src/utils/prisma';
console.log('Keys:', Object.keys(prisma).filter(k => k.toLowerCase().includes('template')));
