import { PrismaClient } from '@prisma/client'

export const restoreDb = async () => {
  const prisma = new PrismaClient();

  const measures = prisma.measure.deleteMany();
  const customers = prisma.customer.deleteMany();

  await prisma.$transaction([measures, customers])
};
