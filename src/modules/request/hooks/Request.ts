import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addRequestToCollection, deleteRequest, editRequest, getAllRequestsInCollection, run, runUnsavedRequest, saveRequest, type Request } from "../actions";
import { useRequestPlaygroundStore, RequestTab } from "../store/useRequestStore";

export const useAddRequestToCollection = (collectionId: string) => {
    const queryClient = useQueryClient();
    const {updateTabFromSavedRequest, activeTabId} = useRequestPlaygroundStore();

    return useMutation({
        mutationFn: async (request: Request) => addRequestToCollection(request, collectionId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['requests', collectionId] });
            queryClient.invalidateQueries({ queryKey: ['collections'] });

            const savedRequest = {
                id: data.id,
                name: data.name,
                method: data.method,
                url: data.url,
                body: typeof data.body === 'string' ? data.body : undefined,
                headers: typeof data.headers === 'string' ? data.headers : undefined,
                parameters: typeof data.parameters === 'string' ? data.parameters : undefined,
            };
            updateTabFromSavedRequest(activeTabId!, savedRequest);
            
            console.log('Request added:', data);
        },
        onError: (error) => {
            console.error('Failed to add request:', error);
            // You can show a toast notification here
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
    const {updateTabFromSavedRequest, activeTabId} = useRequestPlaygroundStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: Request) => saveRequest(requestId, request),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            
            const savedRequest = {
                id: data.id,
                name: data.name,
                method: data.method,
                url: data.url,
                body: typeof data.body === 'string' ? data.body : undefined,
                headers: typeof data.headers === 'string' ? data.headers : undefined,
                parameters: typeof data.parameters === 'string' ? data.parameters : undefined,
            };
            
            updateTabFromSavedRequest(activeTabId!, savedRequest);
            console.log('Request saved:', data);
        },
        onError: (error) => {
            console.error('Failed to save request:', error);
            // You can show a toast notification here
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
        },
        onError: (error) => {
            console.error('Failed to edit request:', error);
            // You can show a toast notification here
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
        },
        onError: (error) => {
            console.error('Failed to delete request:', error);
            // You can show a toast notification here
        }
    });
}

export function useRunRequest(tab: RequestTab) {
  const {setResponseViewerData} = useRequestPlaygroundStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // If request has an ID (saved), use the run function
      if (tab.requestId) {
        return await run(tab.requestId);
      }
      
      // If no ID (unsaved), use runUnsavedRequest with current tab data
      const requestData: Request = {
        name: tab.title || "Untitled Request",
        method: tab.method as any,
        url: tab.url || "",
        body: tab.body,
        headers: tab.headers,
        parameters: tab.parameters,
      };
      
      return await runUnsavedRequest(requestData);
    },
    onSuccess: (data) => {
      if (tab.requestId) {
        queryClient.invalidateQueries({ queryKey: ["requests"] });
      }
      
      if (data.success && data.requestRun) {
        
        let parsedHeaders: Record<string, string> = {};
        try {
          if (typeof data.requestRun.headers === 'string' && data.requestRun.headers.trim() !== '') {
            parsedHeaders = JSON.parse(data.requestRun.headers);
          } else if (typeof data.requestRun.headers === 'object' && data.requestRun.headers !== null) {
            parsedHeaders = data.requestRun.headers as Record<string, string>;
          }
        } catch (e) {
          console.error('Failed to parse headers:', e);
          console.error('Headers value:', data.requestRun.headers);
          parsedHeaders = {};
        }

        const transformedData = {
          success: data.success,
          requestRun: {
            id: data.requestRun.id,
            requestId: data.requestRun.requestId,
            status: data.requestRun.status,
            statusText: data.requestRun.statusText ?? undefined,
            headers: parsedHeaders,
            body: data.requestRun.body ?? undefined,
            durationMs: data.requestRun.durationMs ?? undefined,
            createdAt: data.requestRun.createdAt ? data.requestRun.createdAt.toISOString() : undefined,
          },
          result: data.result
        };
        
        console.log('Response data being set:', transformedData);
        setResponseViewerData(transformedData);
      }
    },
    onError: (error) => {
      console.error('Failed to run request:', error);
      // You can show a toast notification here
    }
  });
}