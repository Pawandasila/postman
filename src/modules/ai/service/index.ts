import {
  JsonBodyGenerationParams,
  JsonBodyResponse,
  RequestSuggestionParams,
  RequestSuggestionResponse,
  ApiDocGenerationParams,
  ApiDocGenerationResponse,
} from "../types";

export async function suggestRequestName(
  params: RequestSuggestionParams
): Promise<RequestSuggestionResponse> {
  const response = await fetch("/api/ai/suggest-name", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

export async function generateJsonBody(
  params: JsonBodyGenerationParams
): Promise<JsonBodyResponse> {
  const response = await fetch("/api/ai/generate-json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

export async function generateApiDocs(
  params: ApiDocGenerationParams
): Promise<ApiDocGenerationResponse> {
  const response = await fetch("/api/ai/generate-docs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}
