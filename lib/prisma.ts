import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

let prismaInstance: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient({ adapter });
  }

  const globalWithPrisma = global as GlobalWithPrisma;
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalWithPrisma.prisma;
}

function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
  }

  return prismaInstance;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client as object, property, receiver);

    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export default prisma;
