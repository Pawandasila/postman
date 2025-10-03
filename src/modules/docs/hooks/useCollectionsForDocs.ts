import { useQuery } from "@tanstack/react-query";
import { getCollectionsWithRequests } from "@/modules/collections/actions";

export interface CollectionWithRequests {
  id: string;
  name: string;
  workspaceId: string;
  requests: Array<{
    id: string;
    name: string;
    method: string;
    url: string;
  }>;
  _count?: {
    requests: number;
  };
}

/**
 * Fetch collections with their requests for documentation generation
 */
export function useCollectionsForDocs(workspaceId?: string) {
  const result = useQuery({
    queryKey: ["collections-with-requests", workspaceId],
    queryFn: async () => getCollectionsWithRequests(workspaceId || ""),
    enabled: !!workspaceId,
  });
  
  return {
    data: result.data?.success ? result.data.collections : [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
  };
}
