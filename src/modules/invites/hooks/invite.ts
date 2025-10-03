"use client";

import { useMutation , useQuery , useQueryClient } from "@tanstack/react-query";
import {
    generateWorkspaceInvite,
    acceptWorkspaceInvite,
    getAllWorkspaceMembers,
    detectWheatherUserIsInvited
} from "@/modules/invites/actions";

export const useGenerateWorkspaceInvite = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateWorkspaceInvite(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invites", workspaceId],
      });
    },
  });
};

export const useAcceptWorkspaceInvite = () => {
  return useMutation({
    mutationFn: (token: string) => acceptWorkspaceInvite(token),
  });
  
};

export const useGetWorkspaceMemebers = (workspaceId: string | undefined)=>{

  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => getAllWorkspaceMembers(workspaceId!),
    enabled: !!workspaceId,
  });
}

export const useCheckUserIsInvited = (userId: string, workspaceId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["user-invite-status", userId, workspaceId],
    queryFn: async () => detectWheatherUserIsInvited(userId, workspaceId),
    enabled: enabled && !!userId && !!workspaceId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export const useCheckUserIsInvitedMutation = () => {
  return useMutation({
    mutationFn: ({ userId, workspaceId }: { userId: string; workspaceId: string }) => 
      detectWheatherUserIsInvited(userId, workspaceId),
  });
}