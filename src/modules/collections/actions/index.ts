'use server'

import db from '@/lib/db'

export const createCollection = async (workspaceId: string, name: string) => {
    const collection = await db.collection.create({
        data: {
            name,
            workspace: {
                connect: { id: workspaceId }
            }
        }
    })

    return {
        success: true,
        collection
    }
}


export const getCollections = async (workspaceId: string) => {
    const collections = await db.collection.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' }
    })

    return {
        success: true,
        collections
    }
}

export const getCollectionById = async (id: string) => {
    const collection = await db.collection.findUnique({
        where: { id }
    })

    return {
        success: true,
        collection
    }
}

export const deleteCollection = async (id: string) => {
    await db.collection.delete({
        where: { id }
    })

    return {
        success: true
    }
}

export const updateCollection = async (id: string, name: string) => {
    const collection = await db.collection.update({
        where: { id },
        data: { name }
    })

    return {
        success: true,
        collection
    }
}