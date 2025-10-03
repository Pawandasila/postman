import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Copy, Link as LinkIcon, Users, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/ui/hint";
import React, { useState } from "react";
import { useWorkspaceStore } from "../Store";
import {
  useGenerateWorkspaceInvite,
  useGetWorkspaceMemebers,
} from "@/modules/invites/hooks/invite";
import {
  useCanManageMembers,
  useUserWorkspacePermissions,
} from "@/hooks/use-workspace-permissions";
import { toast } from "sonner";

const InviteMember = () => {
  const [inviteLink, setInviteLink] = useState("");
  const { selectedWorkspace } = useWorkspaceStore();

  const canManageMembers = useCanManageMembers(selectedWorkspace?.id || "");

  const { data: userPermissions } = useUserWorkspacePermissions(
    selectedWorkspace?.id || ""
  );

  const { mutateAsync, isPending } = useGenerateWorkspaceInvite(
    selectedWorkspace?.id || ""
  );

  const { data: workspaceMembers, isLoading } = useGetWorkspaceMemebers(
    selectedWorkspace?.id || ""
  );

  if (!selectedWorkspace?.id) {
    return null;
  }

  const generateInviteLink = async () => {
    if (!selectedWorkspace?.id) {
      toast.error("Please select a workspace first");
      return;
    }
    try {
      const response = await mutateAsync();
      if (response && response.success && response.inviteUrl) {
        setInviteLink(response.inviteUrl);
        toast.success("Invite link generated!");
      } else {
        setInviteLink("");
        toast.error(response?.message || "Failed to generate invite link");
      }
    } catch (error) {
      toast.error("Failed to generate invite link");
    }
  };

  const copyToClipboard = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard");
    }
  };

  return (
    <DropdownMenu>
      <Hint label={canManageMembers ? "Invite Member" : "Team Members"}>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2 h-9 px-3">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">
              {canManageMembers ? "Invite" : "Team"}
            </span>
            {workspaceMembers && workspaceMembers.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {workspaceMembers.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
      </Hint>

      <DropdownMenuContent className="w-80 rounded-xl" align="end">
        <div className="p-4 space-y-3">
          {/* Header with workspace name and user role */}
          <div className="space-y-1">
            <DropdownMenuLabel className="flex items-center justify-between px-0">
              <span>{selectedWorkspace?.name}</span>
              {userPermissions?.success && userPermissions?.role && (
                <Badge 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {userPermissions.role}
                </Badge>
              )}
            </DropdownMenuLabel>
            <p className="text-xs text-muted-foreground px-0">
              {canManageMembers 
                ? "Manage team members and send invitations" 
                : "View team members"}
            </p>
          </div>
          <DropdownMenuSeparator />

          {/* Team Members List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members
              </h4>
              <span className="text-xs text-muted-foreground">
                {workspaceMembers?.length || 0} member{workspaceMembers?.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center gap-2 p-2">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-muted rounded animate-pulse w-24" />
                    <div className="h-2 bg-muted rounded animate-pulse w-16" />
                  </div>
                </div>
              ) : workspaceMembers && workspaceMembers.length > 0 ? (
                workspaceMembers.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={member.user.image || ""} />
                      <AvatarFallback className="text-xs bg-primary/10">
                        {member.user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.user.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.user.email}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs shrink-0"
                    >
                      {member.role}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No members found
                </p>
              )}
            </div>
          </div>

          {/* Invite Section - Only for admins */}
          {canManageMembers && (
            <>
              <DropdownMenuSeparator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite New Member
                </h4>
                
                <div className="flex gap-2 items-center">
                  <Input
                    value={inviteLink}
                    placeholder="Generate an invite link..."
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    disabled={!inviteLink}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={generateInviteLink}
                  disabled={isPending}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {isPending ? "Generating..." : "Generate Link"}
                </Button>
              </div>
            </>
          )}
          
          {/* Message for non-admin users */}
          {!canManageMembers && (
            <>
              <DropdownMenuSeparator />
              <div className="text-xs text-muted-foreground text-center py-2 bg-muted/50 rounded-lg">
                <Shield className="h-4 w-4 mx-auto mb-1 opacity-50" />
                Only workspace admins can invite new members
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InviteMember;
