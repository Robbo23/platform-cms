import { PrismaClient } from 'prisma/generated/client';

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['info', 'error'],
    errorFormat: 'pretty',
    rejectOnNotFound: true
  });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;

// const { PrismaClient } = require('@prisma/client');
//
// const prisma = global.prisma || new PrismaClient();
//
// if (process.env.NODE_ENV === 'development') global.prisma = prisma;
//
// export default prisma;
