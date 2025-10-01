"use server";

import db from "@/lib/db";
import { REST_METHOD } from "@prisma/client";
import axios, { AxiosRequestConfig } from "axios";

export type Request = {
  name: string;
  url: string;
  method: REST_METHOD;

  body?: string;
  headers?: string;
  parameters?: string;
};

export const addRequestToCollection = async (
  request: Request,
  collectionId: string
) => {
  const newRequest = await db.request.create({
    data: {
      collectionId,
      name: request.name,
      url: request.url,
      method: request.method,
      body: request.body,
      headers: request.headers,
      parameters: request.parameters,
    },
  });

  return newRequest;
};

export const saveRequest = async (requestId: string, request: Request) => {
  const updatedRequest = await db.request.update({
    where: {
      id: requestId,
    },
    data: {
      name: request.name,
      url: request.url,
      method: request.method,
      body: request.body,
      headers: request.headers,
      parameters: request.parameters,
    },
  });

  return updatedRequest;
};

export const getAllRequestsInCollection = async (collectionId: string) => {
  const requests = await db.request.findMany({
    where: {
      collectionId,
    },
  });

  return requests;
};

export const editRequest = async (requestId: string, request: Request) => {
  const updatedRequest = await db.request.update({
    where: { id: requestId },
    data: {
      name: request.name,
      url: request.url,
      method: request.method,
      body: request.body,
      headers: request.headers,
      parameters: request.parameters,
    },
  });

  return updatedRequest;
};

export const deleteRequest = async (requestId: string) => {
  const deletedRequest = await db.request.delete({
    where: { id: requestId },
  });

  return {
    success: true,
    request: deletedRequest,
  };
};

export async function sendRequest(req: {
  method: REST_METHOD;
  url: string;
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  body?: any;
}) {

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json',
    'User-Agent': 'PostBoy/1.0',
  };

  const mergedHeaders = {
    ...defaultHeaders,
    ...(req.headers || {}),
  };

  console.log('sendRequest called with:', {
    method: req.method,
    url: req.url,
    originalHeaders: req.headers,
    mergedHeaders: mergedHeaders,
    parameters: req.parameters,
  });

  const config: AxiosRequestConfig = {
    method: req.method,
    url: req.url,
    headers: mergedHeaders,
    params: req.parameters,
    data: req.body,
    validateStatus: () => true,
  };

  const start = performance.now();

  try {
    const response = await axios(config);
    const end = performance.now();

    console.log('Axios response received:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      dataType: typeof response.data,
    });

    const duration = end - start;
    const size =
      response.headers["content-length"] ||
      new TextEncoder().encode(JSON.stringify(response.data)).length;

    
    let headersObject: Record<string, string> = {};
    try {
      if (response.headers && typeof response.headers === 'object') {
        
        headersObject = Object.keys(response.headers).reduce((acc, key) => {
          const value = response.headers[key];
          if (typeof value === 'string') {
            acc[key] = value;
          } else if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>);
      }
    } catch (e) {
      console.error('Failed to parse response headers:', e);
      headersObject = {};
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: headersObject,
      data: response.data,
      responseTime: Math.round(duration),
      size: size,
    };
  } catch (error : any) {
    const end = performance.now();
    
    return {
      error: error.message,
      duration : Math.round(end - start),
    };
  }
}

export async function runUnsavedRequest(req: Request) {
  try {
    let parsedHeaders: Record<string, string> | undefined;
    let parsedParameters: Record<string, string> | undefined;

    if (req.headers) {
      try {
        parsedHeaders = JSON.parse(req.headers);
      } catch (e) {
        console.error('Failed to parse headers in unsaved request:', e);
        console.error('Headers value:', req.headers);
        parsedHeaders = undefined;
      }
    }

    if (req.parameters) {
      try {
        parsedParameters = JSON.parse(req.parameters);
      } catch (e) {
        console.error('Failed to parse parameters in unsaved request:', e);
        console.error('Parameters value:', req.parameters);
        parsedParameters = undefined;
      }
    }

    
    let parsedBody: any = undefined;
    if (req.body) {
      try {
        
        parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch (e) {
        
        parsedBody = req.body;
      }
    }

    console.log('Request body being sent:', {
      originalBody: req.body,
      parsedBody: parsedBody,
    });

    const requestConfig = {
      method: req.method,
      url: req.url,
      headers: parsedHeaders,
      parameters: parsedParameters,
      body: parsedBody,
    };

    const result = await sendRequest(requestConfig);

    return {
      success: true,
      requestRun: {
        id: `temp-${Date.now()}`,
        requestId: undefined,
        status: result.status ?? 0,
        statusText: result.statusText || (result?.error ? "Error" : null),
        headers: result.headers || {},
        body: result?.data
          ? typeof result.data === "string"
            ? result.data
            : JSON.stringify(result.data)
          : null,
        durationMs: result.responseTime || 0,
        createdAt: new Date(),
      },
      result,
    };
  } catch (error: any) {
    return {
      success: false,
      requestRun: {
        id: `temp-${Date.now()}`,
        requestId: undefined,
        status: 0,
        statusText: "Failed",
        headers: {},
        body: error.message || "Unknown error",
        durationMs: 0,
        createdAt: new Date(),
      },
      error: error.message || "Unknown error",
    };
  }
}

export async function run(requestId: string) {
  try {
    const request = await db.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error("Request not found");
    }

    let parsedHeaders: Record<string, string> | undefined;
    let parsedParameters: Record<string, string> | undefined;

    try {
      if (request.headers) {
        if (typeof request.headers === 'string') {
          parsedHeaders = JSON.parse(request.headers);
        } else if (typeof request.headers === 'object') {
          parsedHeaders = request.headers as Record<string, string>;
        }
      }
    } catch (e) {
      console.error('Failed to parse request headers:', e);
      parsedHeaders = undefined;
    }

    try {
      if (request.parameters) {
        if (typeof request.parameters === 'string') {
          parsedParameters = JSON.parse(request.parameters);
        } else if (typeof request.parameters === 'object') {
          parsedParameters = request.parameters as Record<string, string>;
        }
      }
    } catch (e) {
      console.error('Failed to parse request parameters:', e);
      parsedParameters = undefined;
    }

    const requestConfig = {
      method: request.method,
      url: request.url,
      headers: parsedHeaders,
      parameters: parsedParameters,
      body: request.body || undefined,
    };

    const result = await sendRequest(requestConfig);

    const requestRun = await db.requestRun.create({
      data: {
        requestId: request.id,
        status: result.status ?? 0,
        statusText: result.statusText || (result?.error ? "Error" : null),
        headers: result.headers ? JSON.stringify(result.headers) : JSON.stringify({}),
        body: result?.data
          ? typeof result.data === "string"
            ? result.data
            : JSON.stringify(result.data)
          : null,
        durationMs: result.responseTime || 0,
      },
    });

    if (result?.data && !result?.error) {
      await db.request.update({
        where: { id: requestId },
        data: {
          response: result.data,
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      requestRun,
      result,
    };
  } catch (error: any) {
    try {
      const failedRun = await db.requestRun.create({
        data: {
          requestId,
          status: 0,
          statusText: "Failed",
          headers: JSON.stringify({}),
          body: error.message || "Unknown error",
          durationMs: 0,
        },
      });
      return {
        success: false,
        requestRun: failedRun,
        error: error.message || "Unknown error",
      };
    } catch (dbError: any) {
      return {
        success: false,
        error: `Request failed: ${
          error.message || "Unknown error"
        }. Additionally, failed to log the request run.   Error: ${
          dbError.message || "Unknown error"
        }`,
      };
    }
  }
}
