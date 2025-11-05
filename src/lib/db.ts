import { PrismaClient } from '@prisma/client'

declare global {
    var prisma: PrismaClient | undefined
}

function createPrismaClient() {
    return new PrismaClient({
        log: ['query', 'error', 'warn', 'info'],
    });
}

const db = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db

export default db