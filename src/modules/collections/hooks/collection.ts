import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateCollection, getCollections, getCollectionById, createCollection, deleteCollection  } from "../actions";

export function useCollections(workspaceId: string) {
  return useQuery({
    queryKey: ["collections", workspaceId],
    queryFn: async () => getCollections(workspaceId),
  });
}

export function useCreateCollection(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => createCollection(workspaceId, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", workspaceId] });
    },
  });
}

export function useGetCollection(id: string) {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: async () => getCollectionById(id),
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string }) => updateCollection(data.id, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
    return useMutation({
    mutationFn: async (id: string) => deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
