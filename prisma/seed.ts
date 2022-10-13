import { PrismaClient } from '@prisma/client';
import { Creators } from './seed/creators';

const prisma = new PrismaClient();

const creators = new Creators(prisma);

const main = async () => {
  await creators.createLanguages([{ code: 'EN' }, { code: 'UA' }]);
};

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
