import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })
} catch (e) {
  console.warn('[AI Studio] Database not connected — using mock Prisma client proxy', e)
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  }
  prismaInstance = new Proxy({}, { get: () => noOp }) as unknown as PrismaClient
}

export const db = prismaInstance

if (process.env.NODE_ENV !== 'production' && globalForPrisma) {
  globalForPrisma.prisma = db
}