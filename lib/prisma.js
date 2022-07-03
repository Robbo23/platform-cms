import { PrismaClient } from '@prisma/client/edge';

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'warn', 'query'],
    errorFormat: 'pretty'
  });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
