import { PrismaClient } from '../../app/generated-prisma-client'
import { withAccelerate } from '@prisma/extension-accelerate'

declare global {
    var prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
    return new PrismaClient({
        log: ['query', 'error', 'warn', 'info'],
    }).$extends(withAccelerate())
}

const db = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db

export default db