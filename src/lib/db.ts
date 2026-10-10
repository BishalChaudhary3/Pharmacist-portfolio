// src/lib/db.ts
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // 1. Create a new connection pool
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // 2. Create the adapter
  const adapter = new PrismaPg(pool);
  // 3. Pass the adapter to the PrismaClient constructor
  prismaInstance = new PrismaClient({ adapter });
}

export const db = prismaInstance;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaInstance;
}