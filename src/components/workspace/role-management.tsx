/**
 * Role management UI components for workspace administration
 */

'use client';

import React, { useState } from 'react';
import { MEMBER_ROLE } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  Edit, 
  Eye, 
  Trash2, 
  Crown,
  Mail,
  Calendar,
  Users
} from 'lucide-react';
import { ROLE_DESCRIPTIONS, PERMISSION_DESCRIPTIONS } from '@/lib/permissions';
import { cn } from '@/lib/utils';

interface WorkspaceMember {
  id: string;
  role: MEMBER_ROLE;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
}

interface WorkspaceOwner {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface RoleManagementProps {
  workspaceId: string;
  members: WorkspaceMember[];
  owner?: WorkspaceOwner;
  currentUserRole: MEMBER_ROLE;
  isOwner: boolean;
  onInviteMember?: (email: string, role: MEMBER_ROLE) => Promise<void>;
  onUpdateRole?: (userId: string, role: MEMBER_ROLE) => Promise<void>;
  onRemoveMember?: (userId: string) => Promise<void>;
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

function InviteMemberDialog({ onInvite }: { onInvite?: (email: string, role: MEMBER_ROLE) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MEMBER_ROLE>(MEMBER_ROLE.VIEWER);
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email || !onInvite) return;
    
    setLoading(true);
    try {
      await onInvite(email, role);
      setEmail('');
      setRole(MEMBER_ROLE.VIEWER);
      setOpen(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this workspace with the specified role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as MEMBER_ROLE)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_DESCRIPTIONS).map(([roleValue, desc]) => {
                  const Icon = getRoleIcon(roleValue as MEMBER_ROLE);
                  return (
                    <SelectItem key={roleValue} value={roleValue}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{desc.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {ROLE_DESCRIPTIONS[role]?.description}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!email || loading}>
              {loading ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MemberCard({ 
  member, 
  isOwner, 
  currentUserRole, 
  currentUserId,
  onUpdateRole,
  onRemoveMember 
}: {
  member: WorkspaceMember;
  isOwner: boolean;
  currentUserRole: MEMBER_ROLE;
  currentUserId: string;
  onUpdateRole?: (userId: string, role: MEMBER_ROLE) => Promise<void>;
  onRemoveMember?: (userId: string) => Promise<void>;
}) {
  const Icon = getRoleIcon(member.role);
  const canManageUser = isOwner || currentUserRole === MEMBER_ROLE.ADMIN;
  const isCurrentUser = member.userId === currentUserId;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.user.image} />
              <AvatarFallback>
                {member.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{member.user.name}</p>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{member.user.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={cn('border', getRoleColor(member.role))}>
              <Icon className="w-3 h-3 mr-1" />
              {ROLE_DESCRIPTIONS[member.role]?.name}
            </Badge>
            
            {canManageUser && !isCurrentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onUpdateRole?.(member.userId, MEMBER_ROLE.ADMIN)}
                    disabled={member.role === MEMBER_ROLE.ADMIN}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpdateRole?.(member.userId, MEMBER_ROLE.EDITOR)}
                    disabled={member.role === MEMBER_ROLE.EDITOR}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Make Editor
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpdateRole?.(member.userId, MEMBER_ROLE.VIEWER)}
                    disabled={member.role === MEMBER_ROLE.VIEWER}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Make Viewer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {member.user.name} from this workspace? 
                          They will lose access to all collections and requests.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => onRemoveMember?.(member.userId)}
                        >
                          Remove Member
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OwnerCard({ owner }: { owner: WorkspaceOwner }) {
  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={owner.image} />
            <AvatarFallback>
              {owner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{owner.name}</p>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Crown className="w-3 h-3 mr-1" />
                Owner
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{owner.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RoleManagement({
  workspaceId,
  members,
  owner,
  currentUserRole,
  isOwner,
  onInviteMember,
  onUpdateRole,
  onRemoveMember
}: RoleManagementProps) {
  const canInviteMembers = isOwner || currentUserRole === MEMBER_ROLE.ADMIN;
  const currentUserId = ''; // This should come from your auth context
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-muted-foreground">
            Manage roles and permissions for workspace members
          </p>
        </div>
        {canInviteMembers && (
          <InviteMemberDialog onInvite={onInviteMember} />
        )}
      </div>

      <div className="grid gap-4">
        {owner && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Workspace Owner</h3>
            <OwnerCard owner={owner} />
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">
            Members ({members.length})
          </h3>
          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isOwner={isOwner}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
                onUpdateRole={onUpdateRole}
                onRemoveMember={onRemoveMember}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Role descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do in this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => {
              const Icon = getRoleIcon(role as MEMBER_ROLE);
              return (
                <div key={role} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge className={cn('border', getRoleColor(role as MEMBER_ROLE))}>
                    <Icon className="w-3 h-3 mr-1" />
                    {desc.name}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm">{desc.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}