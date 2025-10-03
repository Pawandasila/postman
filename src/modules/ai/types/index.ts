
// -------------------------Request Name Suggestion-------------------------
export interface RequestSuggestionParams {
  workspaceName: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url?: string;
  description?: string;
}

export interface RequestSuggestion {
  name: string;
  reasoning: string;
  confidence: number;
}

export interface RequestSuggestionResponse {
  suggestions: RequestSuggestion[];
}

// -------------------------JSON Body Generation-------------------------
export interface JsonBodyGenerationParams {
  prompt: string;
  method?: string;
  endpoint?: string;
  context?: string;
  existingSchema?: Record<string, any>;
}

export interface JsonBodyResponse {
  jsonBody: Record<string, any>;
  explanation: string;
  suggestions: string[];
}

// -------------------------API Documentation Generation-------------------------
export interface ApiDocGenerationParams {
  requestId: string;
}

export interface ApiDocHeader {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface ApiDocQueryParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface ApiDocRequestBody {
  contentType: string;
  description: string;
  schema: string;
  example: string;
}

export interface ApiDocResponse {
  statusCode: number;
  description: string;
  example?: string;
}

export interface ApiDocExample {
  title: string;
  description: string;
  request: string;
  response?: string;
}

export interface ApiDocErrorCode {
  code: number;
  message: string;
  description: string;
}

export interface ApiDocumentation {
  title: string;
  summary: string;
  description: string;
  endpoint: {
    method: string;
    url: string;
    baseUrl?: string;
  };
  authentication?: {
    required: boolean;
    type?: string;
    description?: string;
  };
  headers: ApiDocHeader[];
  queryParameters?: ApiDocQueryParam[];
  requestBody?: ApiDocRequestBody;
  responses: ApiDocResponse[];
  examples?: ApiDocExample[];
  notes?: string[];
  errorCodes?: ApiDocErrorCode[];
}

export interface ApiDocGenerationResponse {
  success: boolean;
  documentation: ApiDocumentation;
  metadata: {
    requestId: string;
    requestName: string;
    collectionName: string;
    workspaceName: string;
    createdAt: Date;
    updatedAt: Date;
  };
}