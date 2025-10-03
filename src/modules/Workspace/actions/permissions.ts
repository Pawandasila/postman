"use server";

import db from "@/lib/db";
import { currentUser } from "@/modules/Authentication/actions";
import { MEMBER_ROLE } from "@prisma/client";
import {
  requirePermission,
  requireOwnership,
  getWorkspaceWithPermissions,
} from "@/lib/workspace-permissions";
import { PERMISSIONS } from "@/lib/permissions";

export async function getWorkspaceWithUserPermissions(workspaceId: string) {
  try {
    return await getWorkspaceWithPermissions(workspaceId);
  } catch (error) {
    console.error("Error getting workspace with permissions:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get workspace",
    };
  }
}

export async function updateWorkspace(
  workspaceId: string,
  data: { name?: string; description?: string }
) {
  try {
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
      message:
        error instanceof Error ? error.message : "Failed to update workspace",
    };
  }
}

export async function deleteWorkspace(workspaceId: string) {
  try {
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
      message:
        error instanceof Error ? error.message : "Failed to delete workspace",
    };
  }
}

export async function inviteMemberToWorkspace(
  workspaceId: string,
  email: string,
  role: MEMBER_ROLE = MEMBER_ROLE.VIEWER
) {
  try {
    await requirePermission(PERMISSIONS.WORKSPACE_INVITE_MEMBERS)(workspaceId);

    const { generateWorkspaceInvite } = await import(
      "@/modules/invites/actions"
    );
    const inviteUrl = await generateWorkspaceInvite(workspaceId);

    return {
      success: true,
      inviteUrl,
      message: `Invite created for ${email} with ${role} role`,
    };
  } catch (error) {
    console.error("Error inviting member:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to invite member",
    };
  }
}

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

    await requirePermission(PERMISSIONS.WORKSPACE_CHANGE_ROLES)(workspaceId);

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === userId) {
      throw new Error("Cannot change workspace owner's role");
    }

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

export async function removeMemberFromWorkspace(
  workspaceId: string,
  userId: string
) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    await requirePermission(PERMISSIONS.WORKSPACE_REMOVE_MEMBERS)(workspaceId);

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === userId) {
      throw new Error("Cannot remove workspace owner");
    }

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
      message:
        error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

export async function leaveWorkspace(workspaceId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
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
      throw new Error("You are not a member of this workspace");
    }

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === user.id) {
      throw new Error(
        "Workspace owner cannot leave. Transfer ownership or delete workspace instead."
      );
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
      message:
        error instanceof Error ? error.message : "Failed to leave workspace",
    };
  }
}

export async function getWorkspaceMembers(workspaceId: string) {
  try {
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
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    });

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
      const workspace = await db.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
      });

      if (workspace?.ownerId === user.id) {
        return {
          success: true,
          role: MEMBER_ROLE.ADMIN,
          isOwner: true,
          permissions: [],
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
      permissions: [],
    };
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get permissions",
    };
  }
}
