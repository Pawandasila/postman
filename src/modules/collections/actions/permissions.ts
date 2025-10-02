/**
 * Enhanced collection actions with permission checking
 */

"use server";

import db from "@/lib/db";
import { currentUser } from "@/modules/Authentication/actions";
import { requirePermission } from "@/lib/workspace-permissions";
import { PERMISSIONS } from "@/lib/permissions";

/**
 * Create collection (requires COLLECTION_CREATE permission)
 */
export async function createCollectionWithPermissions(
  workspaceId: string,
  name: string,
  description?: string
) {
  try {
    
    await requirePermission(PERMISSIONS.COLLECTION_CREATE)(workspaceId);

    const collection = await db.collection.create({
      data: {
        name,
        workspaceId,
      },
    });

    return {
      success: true,
      collection,
    };
  } catch (error) {
    console.error("Error creating collection:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create collection",
    };
  }
}

/**
 * Update collection (requires COLLECTION_EDIT permission)
 */
export async function updateCollectionWithPermissions(
  collectionId: string,
  data: { name?: string }
) {
  try {
    
    const collection = await db.collection.findUnique({
      where: { id: collectionId },
      select: { workspaceId: true },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    
    await requirePermission(PERMISSIONS.COLLECTION_EDIT)(collection.workspaceId);

    const updatedCollection = await db.collection.update({
      where: { id: collectionId },
      data,
    });

    return {
      success: true,
      collection: updatedCollection,
    };
  } catch (error) {
    console.error("Error updating collection:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update collection",
    };
  }
}

/**
 * Delete collection (requires COLLECTION_DELETE permission)
 */
export async function deleteCollectionWithPermissions(collectionId: string) {
  try {
    
    const collection = await db.collection.findUnique({
      where: { id: collectionId },
      select: { workspaceId: true },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    
    await requirePermission(PERMISSIONS.COLLECTION_DELETE)(collection.workspaceId);

    await db.collection.delete({
      where: { id: collectionId },
    });

    return {
      success: true,
      message: "Collection deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting collection:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete collection",
    };
  }
}

/**
 * Duplicate collection (requires COLLECTION_DUPLICATE permission)
 */
export async function duplicateCollectionWithPermissions(
  collectionId: string,
  newName?: string
) {
  try {
    
    const collection = await db.collection.findUnique({
      where: { id: collectionId },
      include: {
        requests: true,
      },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    
    await requirePermission(PERMISSIONS.COLLECTION_DUPLICATE)(collection.workspaceId);

    
    const duplicatedCollection = await db.collection.create({
      data: {
        name: newName || `${collection.name} (Copy)`,
        workspaceId: collection.workspaceId,
        requests: {
          create: collection.requests.map(request => ({
            name: request.name,
            method: request.method,
            url: request.url,
            parameters: request.parameters === null ? undefined : (request.parameters as any),
            headers: request.headers === null ? undefined : (request.headers as any),
            body: request.body === null ? undefined : (request.body as any),
          })),
        },
      },
      include: {
        requests: true,
      },
    });

    return {
      success: true,
      collection: duplicatedCollection,
    };
  } catch (error) {
    console.error("Error duplicating collection:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to duplicate collection",
    };
  }
}

/**
 * Get collections with permission check (requires COLLECTION_VIEW permission)
 */
export async function getCollectionsWithPermissions(workspaceId: string) {
  try {
    
    await requirePermission(PERMISSIONS.COLLECTION_VIEW)(workspaceId);

    const collections = await db.collection.findMany({
      where: { workspaceId },
      include: {
        requests: {
          select: {
            id: true,
            name: true,
            method: true,
            url: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      collections,
    };
  } catch (error) {
    console.error("Error getting collections:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get collections",
    };
  }
}