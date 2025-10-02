"use client";

import { useState } from "react";
import { MEMBER_ROLE } from "@prisma/client";
import { Permission } from "@/lib/permissions";

export interface PermissionState {
  loading: boolean;
  userRole: MEMBER_ROLE | null;
  permissions: Permission[];
  isOwner: boolean;
  canPerform: (permission: Permission) => boolean;
  hasRoleLevel: (role: MEMBER_ROLE) => boolean;
}

export function usePermission(permission: Permission): boolean {
  const permissionState = useWorkspacePermissions();
  return permissionState.canPerform(permission);
}

export function useRole(requiredRole: MEMBER_ROLE): boolean {
  const permissionState = useWorkspacePermissions();
  return permissionState.hasRoleLevel(requiredRole);
}

export function useIsOwner(): boolean {
  const permissionState = useWorkspacePermissions();
  return permissionState.isOwner;
}

export function useWorkspacePermissions(): PermissionState {
  const [permissionState] = useState<PermissionState>({
    loading: true,
    userRole: null,
    permissions: [],
    isOwner: false,
    canPerform: () => false,
    hasRoleLevel: () => false,
  });

  return permissionState;
}

export function useAdminOnly(): boolean {
  return useRole(MEMBER_ROLE.ADMIN);
}

export function useEditorOrAbove(): boolean {
  return useRole(MEMBER_ROLE.EDITOR);
}

export function checkClientPermission(
  permissionState: PermissionState,
  permission?: Permission,
  role?: MEMBER_ROLE,
  ownerOnly = false
): boolean {
  if (permissionState.loading) {
    return false;
  }

  if (ownerOnly) {
    return permissionState.isOwner;
  }

  if (permission) {
    return permissionState.canPerform(permission);
  }

  if (role) {
    return permissionState.hasRoleLevel(role);
  }

  return false;
}

export function usePermissionSummary() {
  const permissionState = useWorkspacePermissions();

  if (!permissionState.userRole) {
    return null;
  }

  return {
    role: permissionState.userRole,
    permissions: permissionState.permissions,
    counts: {
      workspace: permissionState.permissions.filter((p) =>
        p.startsWith("workspace:")
      ).length,
      collection: permissionState.permissions.filter((p) =>
        p.startsWith("collection:")
      ).length,
      request: permissionState.permissions.filter((p) =>
        p.startsWith("request:")
      ).length,
      environment: permissionState.permissions.filter((p) =>
        p.startsWith("environment:")
      ).length,
      websocket: permissionState.permissions.filter((p) =>
        p.startsWith("websocket:")
      ).length,
      history: permissionState.permissions.filter((p) =>
        p.startsWith("history:")
      ).length,
    },
    total: permissionState.permissions.length,
  };
}
