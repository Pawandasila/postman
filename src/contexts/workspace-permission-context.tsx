'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkspacePermissions } from '@/hooks/use-workspace-permissions';
import { useWorkspaceStore } from '@/modules/Layout/Store';
import { PermissionState } from '@/hooks/use-permissions';

interface WorkspacePermissionContextType extends PermissionState {
  workspaceId: string | null;
}

const WorkspacePermissionContext = createContext<WorkspacePermissionContextType | null>(null);

interface WorkspacePermissionProviderProps {
  children: ReactNode;
}

export function WorkspacePermissionProvider({ children }: WorkspacePermissionProviderProps) {
  const { selectedWorkspace } = useWorkspaceStore();
  const workspacePermissions = useWorkspacePermissions(selectedWorkspace?.id || '');

  const contextValue: WorkspacePermissionContextType = {
    loading: workspacePermissions.loading,
    userRole: workspacePermissions.userRole || null,
    permissions: workspacePermissions.permissions,
    isOwner: workspacePermissions.isOwner || false,
    canPerform: workspacePermissions.canPerform,
    hasRoleLevel: workspacePermissions.hasRoleLevel,
    workspaceId: selectedWorkspace?.id || null,
  };

  return (
    <WorkspacePermissionContext.Provider value={contextValue}>
      {children}
    </WorkspacePermissionContext.Provider>
  );
}

/**
 * Hook to use workspace permissions from context
 */
export function useWorkspacePermissionContext(): WorkspacePermissionContextType {
  const context = useContext(WorkspacePermissionContext);
  
  if (!context) {
    // Return default state if no context provider
    return {
      loading: true,
      userRole: null,
      permissions: [],
      isOwner: false,
      canPerform: () => false,
      hasRoleLevel: () => false,
      workspaceId: null,
    };
  }
  
  return context;
}

/**
 * Higher-order component to provide workspace permissions
 */
export function withWorkspacePermissions<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithWorkspacePermissionsComponent(props: P) {
    return (
      <WorkspacePermissionProvider>
        <Component {...props} />
      </WorkspacePermissionProvider>
    );
  };
}