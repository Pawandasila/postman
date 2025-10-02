/**
 * Permission display components for showing user capabilities
 */

'use client';

import React from 'react';
import { MEMBER_ROLE } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Shield, 
  Edit, 
  Eye, 
  Lock, 
  Unlock,
  Check,
  X,
  Crown,
  Users,
  FolderOpen,
  Play,
  Globe,
  History
} from 'lucide-react';
import { 
  ROLE_PERMISSIONS, 
  PERMISSIONS, 
  PERMISSION_DESCRIPTIONS,
  ROLE_DESCRIPTIONS,
  Permission
} from '@/lib/permissions';
import { cn } from '@/lib/utils';

interface PermissionBadgeProps {
  permission: Permission;
  hasPermission: boolean;
  size?: 'sm' | 'md';
}

function PermissionBadge({ permission, hasPermission, size = 'md' }: PermissionBadgeProps) {
  const description = PERMISSION_DESCRIPTIONS[permission];
  const badgeSize = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={hasPermission ? 'default' : 'secondary'}
            className={cn(
              badgeSize,
              hasPermission 
                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-500 border-gray-200'
            )}
          >
            {hasPermission ? (
              <Check className="w-3 h-3 mr-1" />
            ) : (
              <X className="w-3 h-3 mr-1" />
            )}
            {permission.split(':')[1]?.replace('_', ' ') || permission}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface PermissionCategoryProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: Permission[];
  userPermissions: Permission[];
  color: string;
}

function PermissionCategory({ 
  title, 
  icon: Icon, 
  permissions, 
  userPermissions, 
  color 
}: PermissionCategoryProps) {
  const hasPermissions = permissions.filter(p => userPermissions.includes(p));
  const percentage = Math.round((hasPermissions.length / permissions.length) * 100);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm">{title}</CardTitle>
              <CardDescription className="text-xs">
                {hasPermissions.length} of {permissions.length} permissions
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {percentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {permissions.map((permission) => (
            <PermissionBadge
              key={permission}
              permission={permission}
              hasPermission={userPermissions.includes(permission)}
              size="sm"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface UserPermissionDisplayProps {
  role: MEMBER_ROLE;
  isOwner?: boolean;
  compact?: boolean;
}

export function UserPermissionDisplay({ role, isOwner = false, compact = false }: UserPermissionDisplayProps) {
  const userPermissions = ROLE_PERMISSIONS[role];
  const roleInfo = ROLE_DESCRIPTIONS[role];
  
  // Categorize permissions
  const workspacePermissions = userPermissions.filter(p => p.startsWith('workspace:'));
  const collectionPermissions = userPermissions.filter(p => p.startsWith('collection:'));
  const requestPermissions = userPermissions.filter(p => p.startsWith('request:'));
  const environmentPermissions = userPermissions.filter(p => p.startsWith('environment:'));
  const websocketPermissions = userPermissions.filter(p => p.startsWith('websocket:'));
  const historyPermissions = userPermissions.filter(p => p.startsWith('history:'));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={cn('border', getRoleColor(role))}>
          {isOwner ? (
            <Crown className="w-3 h-3 mr-1" />
          ) : (
            React.createElement(getRoleIcon(role), { className: "w-3 h-3 mr-1" })
          )}
          {isOwner ? 'Owner' : roleInfo.name}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {userPermissions.length} permissions
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isOwner && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Crown className="w-3 h-3 mr-1" />
              Owner
            </Badge>
          )}
          <Badge className={cn('border', getRoleColor(role))}>
            {React.createElement(getRoleIcon(role), { className: "w-3 h-3 mr-1" })}
            {roleInfo.name}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {userPermissions.length} total permissions
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PermissionCategory
          title="Workspace"
          icon={Users}
          permissions={Object.values(PERMISSIONS).filter(p => p.startsWith('workspace:'))}
          userPermissions={workspacePermissions}
          color="bg-purple-100 text-purple-600"
        />
        <PermissionCategory
          title="Collections"
          icon={FolderOpen}
          permissions={Object.values(PERMISSIONS).filter(p => p.startsWith('collection:'))}
          userPermissions={collectionPermissions}
          color="bg-blue-100 text-blue-600"
        />
        <PermissionCategory
          title="Requests"
          icon={Play}
          permissions={Object.values(PERMISSIONS).filter(p => p.startsWith('request:'))}
          userPermissions={requestPermissions}
          color="bg-green-100 text-green-600"
        />
        <PermissionCategory
          title="Environments"
          icon={Globe}
          permissions={Object.values(PERMISSIONS).filter(p => p.startsWith('environment:'))}
          userPermissions={environmentPermissions}
          color="bg-orange-100 text-orange-600"
        />
        <PermissionCategory
          title="WebSocket"
          icon={Globe}
          permissions={Object.values(PERMISSIONS).filter(p => p.startsWith('websocket:'))}
          userPermissions={websocketPermissions}
          color="bg-indigo-100 text-indigo-600"
        />
        <PermissionCategory
          title="History"
          icon={History}
          permissions={Object.values(PERMISSIONS).filter(p => p.startsWith('history:'))}
          userPermissions={historyPermissions}
          color="bg-gray-100 text-gray-600"
        />
      </div>
    </div>
  );
}

function getRoleIcon(role: MEMBER_ROLE) {
  switch (role) {
    case MEMBER_ROLE.ADMIN:
      return Shield;
    case MEMBER_ROLE.EDITOR:
      return Edit;
    case MEMBER_ROLE.VIEWER:
      return Eye;
    default:
      return Users;
  }
}

function getRoleColor(role: MEMBER_ROLE) {
  switch (role) {
    case MEMBER_ROLE.ADMIN:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case MEMBER_ROLE.EDITOR:
      return 'bg-green-100 text-green-800 border-green-200';
    case MEMBER_ROLE.VIEWER:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

interface PermissionGuardMessageProps {
  requiredPermission?: Permission;
  requiredRole?: MEMBER_ROLE;
  userRole: MEMBER_ROLE;
  isOwner?: boolean;
}

export function PermissionGuardMessage({ 
  requiredPermission, 
  requiredRole, 
  userRole,
  isOwner = false 
}: PermissionGuardMessageProps) {
  const userPermissions = ROLE_PERMISSIONS[userRole];
  
  if (requiredPermission && !userPermissions.includes(requiredPermission)) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Permission Required</p>
              <p className="text-sm text-orange-700">
                You need the "{PERMISSION_DESCRIPTIONS[requiredPermission]}" permission to access this feature.
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Contact a workspace admin to request access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requiredRole && !hasRoleLevel(userRole, requiredRole)) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Higher Role Required</p>
              <p className="text-sm text-orange-700">
                You need {ROLE_DESCRIPTIONS[requiredRole].name} role or higher to access this feature.
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Current role: {ROLE_DESCRIPTIONS[userRole].name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Helper function to check role hierarchy
function hasRoleLevel(userRole: MEMBER_ROLE, requiredRole: MEMBER_ROLE): boolean {
  const roleHierarchy = {
    [MEMBER_ROLE.VIEWER]: 1,
    [MEMBER_ROLE.EDITOR]: 2,
    [MEMBER_ROLE.ADMIN]: 3,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}