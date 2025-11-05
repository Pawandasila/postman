import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

declare global {
    var prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
    const client = new PrismaClient({
        log: ['query', 'error', 'warn', 'info'],
    });
    
    const databaseUrl = process.env.DATABASE_URL || '';
    if (databaseUrl.startsWith('prisma://') || databaseUrl.startsWith('prisma+postgres://')) {
        return client.$extends(withAccelerate());
    }
    
    return client;
}

const db = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db

export default db