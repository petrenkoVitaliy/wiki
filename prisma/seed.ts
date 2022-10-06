import { PrismaClient } from '@prisma/client';
import { Creators } from './seed/creators';

const prisma = new PrismaClient();

const creators = new Creators(prisma);

async function main() {
  await creators.createLanguages([{ code: 'EN' }, { code: 'UA' }]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
