/**
 * Enhanced workspace actions with permission checking
 */

"use server";

import db from "@/lib/db";
import { currentUser } from "@/modules/Authentication/actions";
import { MEMBER_ROLE } from "@prisma/client";
import { 
  requirePermission, 
  requireRole, 
  requireOwnership,
  checkWorkspacePermission,
  getWorkspaceWithPermissions 
} from "@/lib/workspace-permissions";
import { PERMISSIONS } from "@/lib/permissions";

/**
 * Get workspace with user permissions (enhanced version)
 */
export async function getWorkspaceWithUserPermissions(workspaceId: string) {
  try {
    return await getWorkspaceWithPermissions(workspaceId);
  } catch (error) {
    console.error("Error getting workspace with permissions:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get workspace",
    };
  }
}

/**
 * Update workspace (requires WORKSPACE_EDIT permission)
 */
export async function updateWorkspace(
  workspaceId: string,
  data: { name?: string; description?: string }
) {
  try {
    // Check permission
    await requirePermission(PERMISSIONS.WORKSPACE_EDIT)(workspaceId);

    const workspace = await db.workspace.update({
      where: { id: workspaceId },
      data,
    });

    return {
      success: true,
      workspace,
    };
  } catch (error) {
    console.error("Error updating workspace:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update workspace",
    };
  }
}

/**
 * Delete workspace (requires ownership)
 */
export async function deleteWorkspace(workspaceId: string) {
  try {
    // Only owner can delete workspace
    await requireOwnership(workspaceId);

    await db.workspace.delete({
      where: { id: workspaceId },
    });

    return {
      success: true,
      message: "Workspace deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete workspace",
    };
  }
}

/**
 * Invite member to workspace (requires WORKSPACE_INVITE_MEMBERS permission)
 */
export async function inviteMemberToWorkspace(
  workspaceId: string,
  email: string,
  role: MEMBER_ROLE = MEMBER_ROLE.VIEWER
) {
  try {
    // Check permission
    await requirePermission(PERMISSIONS.WORKSPACE_INVITE_MEMBERS)(workspaceId);

    // Generate invite (reuse existing logic)
    const { generateWorkspaceInvite } = await import("@/modules/invites/actions");
    const inviteUrl = await generateWorkspaceInvite(workspaceId);

    // In a real app, you'd send an email here
    // For now, just return the invite URL

    return {
      success: true,
      inviteUrl,
      message: `Invite created for ${email} with ${role} role`,
    };
  } catch (error) {
    console.error("Error inviting member:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to invite member",
    };
  }
}

/**
 * Update member role (requires WORKSPACE_CHANGE_ROLES permission)
 */
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  newRole: MEMBER_ROLE
) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check permission
    await requirePermission(PERMISSIONS.WORKSPACE_CHANGE_ROLES)(workspaceId);

    // Cannot change owner's role
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === userId) {
      throw new Error("Cannot change workspace owner's role");
    }

    // Cannot change your own role (prevents privilege escalation)
    if (userId === user.id) {
      throw new Error("Cannot change your own role");
    }

    const updatedMember = await db.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return {
      success: true,
      member: updatedMember,
      message: `Role updated to ${newRole}`,
    };
  } catch (error) {
    console.error("Error updating member role:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}

/**
 * Remove member from workspace (requires WORKSPACE_REMOVE_MEMBERS permission)
 */
export async function removeMemberFromWorkspace(
  workspaceId: string,
  userId: string
) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check permission
    await requirePermission(PERMISSIONS.WORKSPACE_REMOVE_MEMBERS)(workspaceId);

    // Cannot remove workspace owner
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === userId) {
      throw new Error("Cannot remove workspace owner");
    }

    // Cannot remove yourself (use leave workspace instead)
    if (userId === user.id) {
      throw new Error("Cannot remove yourself. Use leave workspace instead.");
    }

    await db.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    return {
      success: true,
      message: "Member removed successfully",
    };
  } catch (error) {
    console.error("Error removing member:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

/**
 * Leave workspace (anyone can leave, except owner)
 */
export async function leaveWorkspace(workspaceId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is a member
    const member = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!member) {
      throw new Error("You are not a member of this workspace");
    }

    // Check if user is owner
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === user.id) {
      throw new Error("Workspace owner cannot leave. Transfer ownership or delete workspace instead.");
    }

    await db.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    return {
      success: true,
      message: "Left workspace successfully",
    };
  } catch (error) {
    console.error("Error leaving workspace:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to leave workspace",
    };
  }
}

/**
 * Get workspace members with their permissions (requires WORKSPACE_VIEW permission)
 */
export async function getWorkspaceMembers(workspaceId: string) {
  try {
    // Check permission
    await requirePermission(PERMISSIONS.WORKSPACE_VIEW)(workspaceId);

    const members = await db.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: 'desc' }, // ADMIN, EDITOR, VIEWER
        { createdAt: 'asc' },
      ],
    });

    // Get workspace owner info
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return {
      success: true,
      members,
      owner: workspace?.owner,
    };
  } catch (error) {
    console.error("Error getting workspace members:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get members",
    };
  }
}

/**
 * Check user's permissions in workspace (for client-side use)
 */
export async function getUserWorkspacePermissions(workspaceId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const member = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!member) {
      // Check if user is owner
      const workspace = await db.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
      });

      if (workspace?.ownerId === user.id) {
        // Owner has admin role
        return {
          success: true,
          role: MEMBER_ROLE.ADMIN,
          isOwner: true,
          permissions: [], // Will be calculated client-side
        };
      }

      return {
        success: false,
        message: "User is not a member of this workspace",
      };
    }

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    return {
      success: true,
      role: member.role,
      isOwner: workspace?.ownerId === user.id,
      permissions: [], // Will be calculated client-side using ROLE_PERMISSIONS
    };
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get permissions",
    };
  }
}