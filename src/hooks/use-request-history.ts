import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useHistoryStore } from "@/modules/history/store/useHistoryStore";

export interface HistoryEntry {
  id: string;
  requestName: string;
  method: string;
  url: string;
  workspaceName: string;
  collectionName?: string;
  statusCode?: number;
  statusText?: string;
  responseTime?: number;
  executedAt: Date;
}

export interface HistoryStats {
  todayCount: number;
  totalCount: number;
  avgResponseTime: number;
}

export function useRequestHistory(workspaceId?: string) {
  const { shouldRefetch, resetRefetch } = useHistoryStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["request-history", workspaceId],
    queryFn: async () => {
      const url = workspaceId
        ? `/api/history?workspaceId=${workspaceId}`
        : "/api/history";
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      return response.json();
    },
    refetchInterval: 60000,
  });

  // Listen to Zustand store for immediate refetch triggers
  useEffect(() => {
    if (shouldRefetch) {
      queryClient.invalidateQueries({ queryKey: ["request-history"] });
      resetRefetch();
    }
  }, [shouldRefetch, queryClient, resetRefetch]);

  return query;
}

/**
 * Clear user's request history
 */
export function useClearHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId?: string) => {
      const url = workspaceId
        ? `/api/history?workspaceId=${workspaceId}`
        : "/api/history";
      
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear history");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-history"] });
    },
  });
}
