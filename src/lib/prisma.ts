import { PrismaClient } from '@prisma/client';

// This ensures that in a development environment, you don't end up with too many
// connections to the database, by reusing the same prisma instance.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;