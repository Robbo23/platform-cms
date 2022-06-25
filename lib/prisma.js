import { PrismaClient } from 'prisma/generated/client';

// const { PrismaClient } = require('@prisma/client');

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['info', 'query'],
    errorFormat: 'pretty',
    rejectOnNotFound: true
  });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
