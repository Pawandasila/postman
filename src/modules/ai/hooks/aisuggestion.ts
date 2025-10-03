import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { JsonBodyGenerationParams, RequestSuggestionParams, ApiDocGenerationParams } from "../types";
import { generateJsonBody, suggestRequestName, generateApiDocs } from "../service";

export function useSuggestRequestName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: RequestSuggestionParams) => suggestRequestName(params),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["request-suggestions", variables], data, {
        updatedAt: Date.now(),
      });

      toast.success(`Generated ${data.suggestions.length} name suggestions`);
    },
  });
}

export function useGenerateJsonBody() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: JsonBodyGenerationParams) => generateJsonBody(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["json-body"] });
      toast.success("JSON body generated successfully");
    },
    onError: (error) => {
      toast.error("Failed to generate JSON body");
    },
  });
}

export function useGenerateApiDocs() {
  return useMutation({
    mutationFn: (params: ApiDocGenerationParams) => generateApiDocs(params),
    onError: (error) => {
      toast.error("Failed to generate API documentation");
      console.error("Documentation generation error:", error);
    },
  });
}
