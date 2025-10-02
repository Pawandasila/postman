export const PERMISSIONS = {
  // Workspace permissions
  WORKSPACE_VIEW: 'workspace:view',
  WORKSPACE_EDIT: 'workspace:edit',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_MANAGE_MEMBERS: 'workspace:manage_members',
  WORKSPACE_INVITE_MEMBERS: 'workspace:invite_members',
  WORKSPACE_REMOVE_MEMBERS: 'workspace:remove_members',
  WORKSPACE_CHANGE_ROLES: 'workspace:change_roles',
  
  // Collection permissions
  COLLECTION_VIEW: 'collection:view',
  COLLECTION_CREATE: 'collection:create',
  COLLECTION_EDIT: 'collection:edit',
  COLLECTION_DELETE: 'collection:delete',
  COLLECTION_DUPLICATE: 'collection:duplicate',
  
  // Request permissions
  REQUEST_VIEW: 'request:view',
  REQUEST_CREATE: 'request:create',
  REQUEST_EDIT: 'request:edit',
  REQUEST_DELETE: 'request:delete',
  REQUEST_DUPLICATE: 'request:duplicate',
  REQUEST_EXECUTE: 'request:execute',
  REQUEST_EXPORT: 'request:export',
  
  // Environment permissions
  ENVIRONMENT_VIEW: 'environment:view',
  ENVIRONMENT_CREATE: 'environment:create',
  ENVIRONMENT_EDIT: 'environment:edit',
  ENVIRONMENT_DELETE: 'environment:delete',
  
  // WebSocket permissions
  WEBSOCKET_VIEW: 'websocket:view',
  WEBSOCKET_CREATE: 'websocket:create',
  WEBSOCKET_EDIT: 'websocket:edit',
  WEBSOCKET_DELETE: 'websocket:delete',
  WEBSOCKET_CONNECT: 'websocket:connect',
  WEBSOCKET_SEND: 'websocket:send',
  
  // History and logs
  HISTORY_VIEW: 'history:view',
  HISTORY_DELETE: 'history:delete',
  HISTORY_EXPORT: 'history:export',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Base permissions for each role
const VIEWER_PERMISSIONS: Permission[] = [
  // Read-only access to most resources
  PERMISSIONS.WORKSPACE_VIEW,
  PERMISSIONS.COLLECTION_VIEW,
  PERMISSIONS.REQUEST_VIEW,
  PERMISSIONS.REQUEST_EXECUTE,
  PERMISSIONS.REQUEST_EXPORT,
  PERMISSIONS.ENVIRONMENT_VIEW,
  PERMISSIONS.WEBSOCKET_VIEW,
  PERMISSIONS.WEBSOCKET_CONNECT,
  PERMISSIONS.WEBSOCKET_SEND,
  PERMISSIONS.HISTORY_VIEW,
  PERMISSIONS.HISTORY_EXPORT,
];

const EDITOR_PERMISSIONS: Permission[] = [
  // All viewer permissions plus create/edit capabilities
  ...VIEWER_PERMISSIONS,
  PERMISSIONS.COLLECTION_CREATE,
  PERMISSIONS.COLLECTION_EDIT,
  PERMISSIONS.COLLECTION_DUPLICATE,
  PERMISSIONS.REQUEST_CREATE,
  PERMISSIONS.REQUEST_EDIT,
  PERMISSIONS.REQUEST_DUPLICATE,
  PERMISSIONS.ENVIRONMENT_CREATE,
  PERMISSIONS.ENVIRONMENT_EDIT,
  PERMISSIONS.WEBSOCKET_CREATE,
  PERMISSIONS.WEBSOCKET_EDIT,
  PERMISSIONS.HISTORY_DELETE,
];

const ADMIN_PERMISSIONS: Permission[] = [
  // All editor permissions plus administrative capabilities
  ...EDITOR_PERMISSIONS,
  PERMISSIONS.WORKSPACE_EDIT,
  PERMISSIONS.WORKSPACE_DELETE,
  PERMISSIONS.WORKSPACE_MANAGE_MEMBERS,
  PERMISSIONS.WORKSPACE_INVITE_MEMBERS,
  PERMISSIONS.WORKSPACE_REMOVE_MEMBERS,
  PERMISSIONS.WORKSPACE_CHANGE_ROLES,
  PERMISSIONS.COLLECTION_DELETE,
  PERMISSIONS.REQUEST_DELETE,
  PERMISSIONS.ENVIRONMENT_DELETE,
  PERMISSIONS.WEBSOCKET_DELETE,
];

// Role definitions with their respective permissions
export const ROLE_PERMISSIONS = {
  VIEWER: VIEWER_PERMISSIONS,
  EDITOR: EDITOR_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
} as const;

// Role hierarchy for easier permission checking
export const ROLE_HIERARCHY = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
} as const;


export function hasPermission(role: keyof typeof ROLE_PERMISSIONS, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}


export function hasRoleLevel(userRole: keyof typeof ROLE_HIERARCHY, requiredRole: keyof typeof ROLE_HIERARCHY): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}


export function getRolePermissions(role: keyof typeof ROLE_PERMISSIONS): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}


export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.WORKSPACE_VIEW]: 'View workspace details and members',
  [PERMISSIONS.WORKSPACE_EDIT]: 'Edit workspace name and description',
  [PERMISSIONS.WORKSPACE_DELETE]: 'Delete the workspace',
  [PERMISSIONS.WORKSPACE_MANAGE_MEMBERS]: 'Manage workspace members',
  [PERMISSIONS.WORKSPACE_INVITE_MEMBERS]: 'Invite new members to workspace',
  [PERMISSIONS.WORKSPACE_REMOVE_MEMBERS]: 'Remove members from workspace',
  [PERMISSIONS.WORKSPACE_CHANGE_ROLES]: 'Change member roles and permissions',
  
  [PERMISSIONS.COLLECTION_VIEW]: 'View collections and their contents',
  [PERMISSIONS.COLLECTION_CREATE]: 'Create new collections',
  [PERMISSIONS.COLLECTION_EDIT]: 'Edit collection names and organization',
  [PERMISSIONS.COLLECTION_DELETE]: 'Delete collections permanently',
  [PERMISSIONS.COLLECTION_DUPLICATE]: 'Duplicate existing collections',
  
  [PERMISSIONS.REQUEST_VIEW]: 'View API requests and their details',
  [PERMISSIONS.REQUEST_CREATE]: 'Create new API requests',
  [PERMISSIONS.REQUEST_EDIT]: 'Edit request details, headers, and body',
  [PERMISSIONS.REQUEST_DELETE]: 'Delete requests permanently',
  [PERMISSIONS.REQUEST_DUPLICATE]: 'Duplicate existing requests',
  [PERMISSIONS.REQUEST_EXECUTE]: 'Execute API requests and view responses',
  [PERMISSIONS.REQUEST_EXPORT]: 'Export requests and collections',
  
  [PERMISSIONS.ENVIRONMENT_VIEW]: 'View environment variables',
  [PERMISSIONS.ENVIRONMENT_CREATE]: 'Create new environments',
  [PERMISSIONS.ENVIRONMENT_EDIT]: 'Edit environment variables and values',
  [PERMISSIONS.ENVIRONMENT_DELETE]: 'Delete environments permanently',
  
  [PERMISSIONS.WEBSOCKET_VIEW]: 'View WebSocket connections and messages',
  [PERMISSIONS.WEBSOCKET_CREATE]: 'Create new WebSocket connections',
  [PERMISSIONS.WEBSOCKET_EDIT]: 'Edit WebSocket connection settings',
  [PERMISSIONS.WEBSOCKET_DELETE]: 'Delete WebSocket connections',
  [PERMISSIONS.WEBSOCKET_CONNECT]: 'Connect to WebSocket endpoints',
  [PERMISSIONS.WEBSOCKET_SEND]: 'Send messages through WebSocket connections',
  
  [PERMISSIONS.HISTORY_VIEW]: 'View request and response history',
  [PERMISSIONS.HISTORY_DELETE]: 'Delete items from history',
  [PERMISSIONS.HISTORY_EXPORT]: 'Export history and logs',
} as const;


export const ROLE_DESCRIPTIONS = {
  VIEWER: {
    name: 'Viewer',
    description: 'Can view and execute requests but cannot modify them',
    color: 'blue',
    icon: 'Eye',
  },
  EDITOR: {
    name: 'Editor', 
    description: 'Can create, edit, and manage requests and collections',
    color: 'green',
    icon: 'Edit',
  },
  ADMIN: {
    name: 'Admin',
    description: 'Full access including workspace management and member permissions',
    color: 'purple',
    icon: 'Shield',
  },
} as const;