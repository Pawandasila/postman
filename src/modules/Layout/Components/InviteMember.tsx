import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Copy, Link as LinkIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hint } from "@/components/ui/hint";
import React, { useState } from "react";
import { useWorkspaceStore } from "../Store";
import {
  useGenerateWorkspaceInvite,
  useGetWorkspaceMemebers,
} from "@/modules/invites/hooks/invite";
import { useCanManageMembers } from "@/hooks/use-workspace-permissions";
import { toast } from "sonner";

const InviteMember = () => {
  const [inviteLink, setInviteLink] = useState("");
  const { selectedWorkspace } = useWorkspaceStore();

  const canManageMembers = useCanManageMembers(selectedWorkspace?.id || "");

  const { mutateAsync, isPending } = useGenerateWorkspaceInvite(
    selectedWorkspace?.id || ""
  );

  const { data: workspaceMembers, isLoading } = useGetWorkspaceMemebers(
    selectedWorkspace?.id || ""
  );

  if (!canManageMembers) {
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
      <Hint label="Invite Member">
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2 h-9 px-3">
            <UserPlus className="h-4 w-4" />
            <span className="hidden md:inline">Invite</span>
          </Button>
        </DropdownMenuTrigger>
      </Hint>

      <DropdownMenuContent className="w-80 rounded-xl" align="end">
        <div className="p-4">
          <DropdownMenuLabel>
            Invite to {selectedWorkspace?.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Members Avatars */}
          <div className="flex -space-x-2 overflow-hidden mb-3">
            {isLoading ? (
              <p className="text-xs text-muted-foreground">
                Loading members...
              </p>
            ) : (
              workspaceMembers?.map((member: any) => (
                <Hint
                  key={member.id}
                  label={member.user.name || "Unknown User"}
                >
                  <Avatar className="border-2 border-background size-8 mt-2">
                    <AvatarImage src={member.user.image || ""} />
                    <AvatarFallback>
                      {member.user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </Hint>
              ))
            )}
          </div>

          {/* Invite Link Input */}
          <div className="flex gap-2 items-center">
            <Input
              value={inviteLink}
              placeholder="Generate an invite link..."
              readOnly
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              disabled={!inviteLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Generate Button */}
          <Button
            className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={generateInviteLink}
            disabled={isPending}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {isPending ? "Generating..." : "Generate Link"}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InviteMember;
