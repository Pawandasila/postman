"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MEMBER_ROLE } from "@prisma/client";
import {
  getUserWorkspacePermissions,
  updateMemberRole,
  removeMemberFromWorkspace,
  inviteMemberToWorkspace,
  getWorkspaceMembers,
} from "@/modules/Workspace/actions/permissions";

import { ROLE_PERMISSIONS, Permission } from "@/lib/permissions";
import {
  createCollectionWithPermissions,
  deleteCollectionWithPermissions,
  duplicateCollectionWithPermissions,
  updateCollectionWithPermissions,
} from "@/modules/collections/actions/permissions";

export function useUserWorkspacePermissions(workspaceId: string) {
  return useQuery({
    queryKey: ["user-permissions", workspaceId],
    queryFn: () => getUserWorkspacePermissions(workspaceId),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWorkspacePermissions(workspaceId: string) {
  const { data: permissionData, isLoading } =
    useUserWorkspacePermissions(workspaceId);

  if (!permissionData?.success || isLoading || !permissionData.role) {
    return {
      loading: isLoading,
      userRole: null,
      permissions: [],
      isOwner: false,
      canPerform: () => false,
      hasRoleLevel: () => false,
    };
  }

  const permissions = ROLE_PERMISSIONS[permissionData.role];

  return {
    loading: false,
    userRole: permissionData.role,
    permissions,
    isOwner: permissionData.isOwner || false,
    canPerform: (permission: Permission) => permissions.includes(permission),
    hasRoleLevel: (role: MEMBER_ROLE) => {
      const roleHierarchy = {
        [MEMBER_ROLE.VIEWER]: 1,
        [MEMBER_ROLE.EDITOR]: 2,
        [MEMBER_ROLE.ADMIN]: 3,
      };
      return roleHierarchy[permissionData.role] >= roleHierarchy[role];
    },
  };
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: MEMBER_ROLE }) =>
      updateMemberRole(workspaceId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      removeMemberFromWorkspace(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
    },
  });
}

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: MEMBER_ROLE }) =>
      inviteMemberToWorkspace(workspaceId, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
    },
  });
}

export function useCreateCollectionWithPermissions(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name }: { name: string }) =>
      createCollectionWithPermissions(workspaceId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", workspaceId] });
    },
  });
}

export function useUpdateCollectionWithPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: string;
      data: { name?: string };
    }) => updateCollectionWithPermissions(collectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDeleteCollectionWithPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) =>
      deleteCollectionWithPermissions(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDuplicateCollectionWithPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      newName,
    }: {
      collectionId: string;
      newName?: string;
    }) => duplicateCollectionWithPermissions(collectionId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useCanCreateCollection(workspaceId: string): boolean {
  const permissions = useWorkspacePermissions(workspaceId);
  return permissions.canPerform("collection:create");
}

export function useCanEditCollection(workspaceId: string): boolean {
  const permissions = useWorkspacePermissions(workspaceId);
  return permissions.canPerform("collection:edit");
}

export function useCanDeleteCollection(workspaceId: string): boolean {
  const permissions = useWorkspacePermissions(workspaceId);
  return permissions.canPerform("collection:delete");
}

export function useCanManageMembers(workspaceId: string): boolean {
  const permissions = useWorkspacePermissions(workspaceId);
  return (
    permissions.canPerform("workspace:invite_members") || permissions.isOwner
  );
}

export function useIsWorkspaceAdmin(workspaceId: string): boolean {
  const permissions = useWorkspacePermissions(workspaceId);
  return (
    permissions.hasRoleLevel(MEMBER_ROLE.ADMIN) ||
    (permissions.isOwner ?? false)
  );
}

export function useIsWorkspaceEditor(workspaceId: string): boolean {
  const permissions = useWorkspacePermissions(workspaceId);
  return (
    permissions.hasRoleLevel(MEMBER_ROLE.EDITOR) ||
    (permissions.isOwner ?? false)
  );
}
