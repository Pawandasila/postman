import { MEMBER_ROLE } from "@prisma/client";
import {
  Permission,
  hasPermission,
  hasRoleLevel,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from "@/lib/permissions";
import db from "@/lib/db";
import { currentUser } from "@/modules/Authentication/actions";

export interface WorkspaceMemberWithPermissions {
  id: string;
  role: MEMBER_ROLE;
  userId: string;
  workspaceId: string;
  permissions: Permission[];
  canPerform: (permission: Permission) => boolean;
  hasRoleLevel: (role: MEMBER_ROLE) => boolean;
}

export async function getWorkspaceMember(
  workspaceId: string,
  userId?: string
): Promise<WorkspaceMemberWithPermissions | null> {
  const user = userId ? { id: userId } : await currentUser();

  if (!user) {
    return null;
  }

  const member = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspaceId,
      },
    },
  });

  if (!member) {
    return null;
  }

  const permissions = ROLE_PERMISSIONS[member.role];

  return {
    ...member,
    permissions,
    canPerform: (permission: Permission) =>
      hasPermission(member.role, permission),
    hasRoleLevel: (role: MEMBER_ROLE) => hasRoleLevel(member.role, role),
  };
}

export async function checkWorkspacePermission(
  workspaceId: string,
  permission: Permission,
  userId?: string
): Promise<boolean> {
  const member = await getWorkspaceMember(workspaceId, userId);
  return member?.canPerform(permission) ?? false;
}

export async function checkWorkspaceRole(
  workspaceId: string,
  requiredRole: MEMBER_ROLE,
  userId?: string
): Promise<boolean> {
  const member = await getWorkspaceMember(workspaceId, userId);
  return member?.hasRoleLevel(requiredRole) ?? false;
}

export async function isWorkspaceOwner(
  workspaceId: string,
  userId?: string
): Promise<boolean> {
  const user = userId ? { id: userId } : await currentUser();

  if (!user) {
    return false;
  }

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true },
  });

  return workspace?.ownerId === user.id;
}

export async function getWorkspaceWithPermissions(workspaceId: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
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
      },
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

  if (!workspace) {
    return null;
  }

  const userMember = workspace.members.find((m) => m.userId === user.id);

  if (!userMember && workspace.ownerId !== user.id) {
    throw new Error("Access denied: User is not a member of this workspace");
  }

  const userRole = userMember?.role ?? MEMBER_ROLE.ADMIN; // Owner is admin
  const userPermissions = ROLE_PERMISSIONS[userRole];

  return {
    ...workspace,
    userRole,
    userPermissions,
    isOwner: workspace.ownerId === user.id,
    canPerform: (permission: Permission) => hasPermission(userRole, permission),
    hasRoleLevel: (role: MEMBER_ROLE) => hasRoleLevel(userRole, role),
  };
}

export function requirePermission(permission: Permission) {
  return async function permissionMiddleware(
    workspaceId: string,
    userId?: string
  ): Promise<void> {
    const hasAccess = await checkWorkspacePermission(
      workspaceId,
      permission,
      userId
    );

    if (!hasAccess) {
      throw new Error(`Access denied: Missing permission '${permission}'`);
    }
  };
}

export function requireRole(role: MEMBER_ROLE) {
  return async function roleMiddleware(
    workspaceId: string,
    userId?: string
  ): Promise<void> {
    const hasRole = await checkWorkspaceRole(workspaceId, role, userId);

    if (!hasRole) {
      throw new Error(`Access denied: Requires '${role}' role or higher`);
    }
  };
}

export async function requireOwnership(
  workspaceId: string,
  userId?: string
): Promise<void> {
  const isOwner = await isWorkspaceOwner(workspaceId, userId);

  if (!isOwner) {
    throw new Error(
      "Access denied: Only workspace owner can perform this action"
    );
  }
}

export async function getWorkspaceMembers(workspaceId: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Check if user has permission to view members
  const canViewMembers = await checkWorkspacePermission(
    workspaceId,
    PERMISSIONS.WORKSPACE_VIEW
  );

  if (!canViewMembers) {
    throw new Error("Access denied: Cannot view workspace members");
  }

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
  });

  return members.map((member) => ({
    ...member,
    permissions: ROLE_PERMISSIONS[member.role],
    canPerform: (permission: Permission) =>
      hasPermission(member.role, permission),
    hasRoleLevel: (role: MEMBER_ROLE) => hasRoleLevel(member.role, role),
  }));
}

export function getPermissionSummary(role: MEMBER_ROLE) {
  const permissions = ROLE_PERMISSIONS[role];

  return {
    role,
    permissions,
    counts: {
      workspace: permissions.filter((p) => p.startsWith("workspace:")).length,
      collection: permissions.filter((p) => p.startsWith("collection:")).length,
      request: permissions.filter((p) => p.startsWith("request:")).length,
      environment: permissions.filter((p) => p.startsWith("environment:"))
        .length,
      websocket: permissions.filter((p) => p.startsWith("websocket:")).length,
      history: permissions.filter((p) => p.startsWith("history:")).length,
    },
    total: permissions.length,
  };
}
