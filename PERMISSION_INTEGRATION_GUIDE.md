# Permission Hooks Integration Guide

## 📋 Overview

I've created comprehensive permission hooks that integrate with your existing workspace system. Here's how to use them:

## 🔧 New Hooks Created

### 1. **Core Permission Hooks** (`/src/hooks/use-workspace-permissions.ts`)

```typescript
// Get user's permissions for a specific workspace
const permissions = useWorkspacePermissions(workspaceId);

// Check specific permissions
const canCreate = useCanCreateCollection(workspaceId);
const canEdit = useCanEditCollection(workspaceId);
const canDelete = useCanDeleteCollection(workspaceId);
const canManage = useCanManageMembers(workspaceId);

// Check role levels
const isAdmin = useIsWorkspaceAdmin(workspaceId);
const isEditor = useIsWorkspaceEditor(workspaceId);
```

### 2. **Permission-Protected Action Hooks**

```typescript
// Collection management with permissions
const createCollection = useCreateCollectionWithPermissions(workspaceId);
const updateCollection = useUpdateCollectionWithPermissions();
const deleteCollection = useDeleteCollectionWithPermissions();
const duplicateCollection = useDuplicateCollectionWithPermissions();

// Member management
const updateRole = useUpdateMemberRole(workspaceId);
const removeMember = useRemoveMember(workspaceId);
const inviteMember = useInviteMember(workspaceId);
```

### 3. **Context Provider** (`/src/contexts/workspace-permission-context.tsx`)

```typescript
// Provides workspace permissions through React context
<WorkspacePermissionProvider>
  <YourWorkspaceComponents />
</WorkspacePermissionProvider>

// Use in components
const { canPerform, userRole, isOwner } = useWorkspacePermissionContext();
```

## 🚀 Integration Steps

### Step 1: Wrap Your Workspace Layout

```typescript
// In your workspace layout or main page
import { WorkspacePermissionProvider } from '@/contexts/workspace-permission-context';

export default function WorkspaceLayout({ children }) {
  return (
    <WorkspacePermissionProvider>
      {children}
    </WorkspacePermissionProvider>
  );
}
```

### Step 2: Update Collection Components

```typescript
// Replace your existing collection hooks
import { 
  useCreateCollectionWithPermissions,
  useCanCreateCollection 
} from '@/hooks/use-workspace-permissions';

function CollectionSidebar() {
  const { selectedWorkspace } = useWorkspaceStore();
  const canCreate = useCanCreateCollection(selectedWorkspace?.id || '');
  const createCollection = useCreateCollectionWithPermissions(selectedWorkspace?.id || '');

  const handleCreate = async () => {
    try {
      await createCollection.mutateAsync({ name: 'New Collection' });
    } catch (error) {
      // Handle permission error
      console.error('Permission denied:', error);
    }
  };

  return (
    <div>
      {canCreate && (
        <Button onClick={handleCreate}>
          Create Collection
        </Button>
      )}
    </div>
  );
}
```

### Step 3: Add Member Management

```typescript
import { 
  useWorkspaceMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useInviteMember 
} from '@/hooks/use-workspace-permissions';

function MemberManagementPage() {
  const { selectedWorkspace } = useWorkspaceStore();
  const workspaceId = selectedWorkspace?.id || '';
  
  const { data: members } = useWorkspaceMembers(workspaceId);
  const updateRole = useUpdateMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);
  const inviteMember = useInviteMember(workspaceId);

  return (
    <RoleManagement
      workspaceId={workspaceId}
      members={members?.members || []}
      onUpdateRole={({ userId, role }) => updateRole.mutate({ userId, role })}
      onRemoveMember={(userId) => removeMember.mutate(userId)}
      onInviteMember={({ email, role }) => inviteMember.mutate({ email, role })}
    />
  );
}
```

### Step 4: Update Navigation Components

```typescript
import { useCanManageMembers } from '@/hooks/use-workspace-permissions';

function WorkspaceNavigation() {
  const { selectedWorkspace } = useWorkspaceStore();
  const canManage = useCanManageMembers(selectedWorkspace?.id || '');

  return (
    <nav>
      <Link href="/collections">Collections</Link>
      <Link href="/requests">Requests</Link>
      {canManage && (
        <Link href="/members">Team Members</Link>
      )}
    </nav>
  );
}
```

## 📝 Example Component Integration

Here's a complete example of how to integrate with your existing components:

```typescript
// Enhanced Collection Component
'use client';

import { useWorkspaceStore } from '@/modules/Layout/Store';
import { 
  useCanCreateCollection,
  useCanEditCollection,
  useCanDeleteCollection,
  useCreateCollectionWithPermissions
} from '@/hooks/use-workspace-permissions';

export default function EnhancedCollections() {
  const { selectedWorkspace } = useWorkspaceStore();
  const workspaceId = selectedWorkspace?.id || '';
  
  // Permission checks
  const canCreate = useCanCreateCollection(workspaceId);
  const canEdit = useCanEditCollection(workspaceId);
  const canDelete = useCanDeleteCollection(workspaceId);
  
  // Permission-protected actions
  const createCollection = useCreateCollectionWithPermissions(workspaceId);

  const handleCreateCollection = async (name: string) => {
    try {
      const result = await createCollection.mutateAsync({ name });
      if (result.success) {
        // Success
      } else {
        // Handle error
        console.error(result.message);
      }
    } catch (error) {
      console.error('Permission denied or other error:', error);
    }
  };

  return (
    <div>
      {canCreate && (
        <Button 
          onClick={() => handleCreateCollection('New Collection')}
          disabled={createCollection.isPending}
        >
          {createCollection.isPending ? 'Creating...' : 'Create Collection'}
        </Button>
      )}
      
      {/* Your existing collection list with edit/delete buttons based on permissions */}
      {collections.map(collection => (
        <div key={collection.id}>
          <span>{collection.name}</span>
          {canEdit && <Button>Edit</Button>}
          {canDelete && <Button variant="destructive">Delete</Button>}
        </div>
      ))}
    </div>
  );
}
```

## ⚡ Quick Start Checklist

- [ ] Add `WorkspacePermissionProvider` to your workspace layout
- [ ] Replace collection creation with `useCreateCollectionWithPermissions`
- [ ] Add permission checks to UI buttons (`useCanCreateCollection`, etc.)
- [ ] Implement member management with new hooks
- [ ] Update navigation to show/hide based on permissions
- [ ] Add error handling for permission-denied scenarios

## 🎯 Benefits

1. **Automatic Permission Checks**: Server-side validation prevents unauthorized actions
2. **Clean UI**: Buttons/features auto-hide based on user permissions
3. **Type Safety**: Full TypeScript support with proper error handling
4. **Cache Management**: Automatic query invalidation when data changes
5. **Integration**: Works seamlessly with your existing Zustand store and TanStack Query

The permission system is now fully integrated and ready to use! 🚀