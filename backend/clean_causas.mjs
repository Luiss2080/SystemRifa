import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.causaSolidaria.deleteMany({});
  console.log('Causas cleaned successfully.');
}
main().finally(() => prisma.$disconnect());
