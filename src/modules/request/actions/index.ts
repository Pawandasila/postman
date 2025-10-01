'use server'

import db from '@/lib/db'
import { REST_METHOD } from '@prisma/client'


export type Request = {
    name: string
    url: string
    method: REST_METHOD

    body?: string
    headers?: string
    parameters?: string
}

export const addRequestToCollection = async (request: Request, collectionId: string) => {
    const newRequest = await db.request.create({
        data: {
            collectionId,
            name: request.name,
            url: request.url,
            method: request.method,
            body: request.body,
            headers: request.headers,
            parameters: request.parameters
        }
    })

    return newRequest;
}


export const saveRequest = async (requestId: string, request: Request) => {
    const updatedRequest = await db.request.update({
        where: {
            id: requestId
        },
        data: {
            name: request.name,
            url: request.url,
            method: request.method,
            body: request.body,
            headers: request.headers,
            parameters: request.parameters
        }
    })

    return updatedRequest;
}

export const getAllRequestsInCollection = async (collectionId: string) => { 
    const requests = await db.request.findMany({
        where: {
            collectionId
        }
    })

    return requests;
}

export const editRequest = async (requestId: string, request: Request) => {
    const updatedRequest = await db.request.update({
        where: { id: requestId },
        data: {
            name: request.name,
            url: request.url,
            method: request.method,
            body: request.body,
            headers: request.headers,
            parameters: request.parameters
        }
    })

    return updatedRequest;
}

export const deleteRequest = async (requestId: string) => {
    const deletedRequest = await db.request.delete({
        where: { id: requestId }
    })
    
    return {
        success: true,
        request: deletedRequest
    };
}