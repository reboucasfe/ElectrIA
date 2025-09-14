import { PrismaClient } from '@prisma/client';

// Este é um padrão comum para evitar a criação de muitas instâncias do Prisma Client
// em um ambiente serverless ou com hot-reloading.

declare global {
  // permite declarações `var` globais
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;