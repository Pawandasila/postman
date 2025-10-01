import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addRequestToCollection, deleteRequest, editRequest, getAllRequestsInCollection, saveRequest, type Request } from "../actions";

export const useAddRequestToCollection = (collectionId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: Request) => addRequestToCollection(request, collectionId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['requests', collectionId] });
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            console.log('Request added:', data);
        }
    });
}

export const useGetAllRequestsInCollection = (collectionId: string) => {
    return useQuery({
        queryKey: ['requests', collectionId],
        queryFn: () => getAllRequestsInCollection(collectionId),
        enabled: !!collectionId
    });
}

export const useSaveRequest = (requestId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: Request) => saveRequest(requestId, request),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            console.log('Request saved:', data);
        }
    });
}

export const useEditRequest = (requestId: string, collectionId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: Request) => editRequest(requestId, request),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            if (collectionId) {
                queryClient.invalidateQueries({ queryKey: ['requests', collectionId] });
            }
            console.log('Request edited:', data);
        }
    });
}

export const useDeleteRequest = (collectionId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: string) => deleteRequest(requestId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            if (collectionId) {
                queryClient.invalidateQueries({ queryKey: ['requests', collectionId] });
            }
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            console.log('Request deleted:', data);
        }
    });
}