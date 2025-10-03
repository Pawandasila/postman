"use server";

import { createRequestHistory } from "@/lib/request-history";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { REST_METHOD } from "@prisma/client";

export interface SaveHistoryParams {
  workspaceId: string;
  workspaceName: string;
  collectionId?: string;
  collectionName?: string;
  requestId?: string;
  requestName: string;
  method: string;
  url: string;
  statusCode?: number;
  statusText?: string;
  responseTime?: number;
  responseSize?: number;
  headers?: Record<string, any>;
  params?: Record<string, any>;
  body?: Record<string, any>;
  response?: Record<string, any>;
}

export async function saveRequestToHistory(params: SaveHistoryParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Convert method string to REST_METHOD enum
    const method = params.method.toUpperCase() as REST_METHOD;

    const history = await createRequestHistory({
      userId: session.user.id,
      workspaceId: params.workspaceId,
      workspaceName: params.workspaceName,
      collectionId: params.collectionId,
      collectionName: params.collectionName,
      requestId: params.requestId,
      requestName: params.requestName,
      method,
      url: params.url,
      statusCode: params.statusCode,
      statusText: params.statusText,
      responseTime: params.responseTime,
      responseSize: params.responseSize,
      headers: params.headers,
      params: params.params,
      body: params.body,
      response: params.response,
    });

    return {
      success: true,
      history,
    };
  } catch (error) {
    console.error("Error saving request history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save history",
    };
  }
}
