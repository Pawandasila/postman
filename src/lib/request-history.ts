import db from "@/lib/db";
import { REST_METHOD } from "@prisma/client";

export interface CreateHistoryParams {
  userId: string;
  workspaceId: string;
  workspaceName: string;
  collectionId?: string;
  collectionName?: string;
  requestId?: string;
  requestName: string;
  method: REST_METHOD;
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

/**
 * Create a new request history entry
 * Automatically sets expiration to 24 hours from now
 */
export async function createRequestHistory(params: CreateHistoryParams) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

  return await db.requestHistory.create({
    data: {
      userId: params.userId,
      workspaceId: params.workspaceId,
      workspaceName: params.workspaceName,
      collectionId: params.collectionId,
      collectionName: params.collectionName,
      requestId: params.requestId,
      requestName: params.requestName,
      method: params.method,
      url: params.url,
      statusCode: params.statusCode,
      statusText: params.statusText,
      responseTime: params.responseTime,
      responseSize: params.responseSize,
      headers: params.headers,
      params: params.params,
      body: params.body,
      response: params.response,
      expiresAt,
    },
  });
}

/**
 * Get request history for a user
 * Optionally filter by workspace
 * Returns only non-expired entries
 */
export async function getUserRequestHistory(
  userId: string,
  options?: {
    workspaceId?: string;
    limit?: number;
  }
) {
  const now = new Date();
  
  return await db.requestHistory.findMany({
    where: {
      userId,
      workspaceId: options?.workspaceId,
      expiresAt: {
        gt: now, // Only get non-expired entries
      },
    },
    orderBy: {
      executedAt: "desc",
    },
    take: options?.limit || 100,
  });
}

/**
 * Get request history grouped by date (Today, Yesterday)
 */
export async function getUserRequestHistoryGrouped(
  userId: string,
  workspaceId?: string
) {
  const now = new Date();
  const history = await getUserRequestHistory(userId, { workspaceId });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const grouped = {
    today: history.filter((h: any) => h.executedAt >= today),
    older: history.filter((h: any) => h.executedAt < today),
  };

  return grouped;
}

/**
 * Delete expired history entries
 * Should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredHistory() {
  const now = new Date();
  
  const result = await db.requestHistory.deleteMany({
    where: {
      expiresAt: {
        lte: now,
      },
    },
  });

  return result.count;
}

/**
 * Delete all history for a user
 */
export async function clearUserHistory(userId: string, workspaceId?: string) {
  return await db.requestHistory.deleteMany({
    where: {
      userId,
      workspaceId,
    },
  });
}

/**
 * Get history statistics for a user
 */
export async function getUserHistoryStats(userId: string, workspaceId?: string) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalToday, totalAll, avgResponseTime] = await Promise.all([
    // Requests today
    db.requestHistory.count({
      where: {
        userId,
        workspaceId,
        executedAt: { gte: today },
        expiresAt: { gt: now },
      },
    }),
    
    // Total non-expired requests
    db.requestHistory.count({
      where: {
        userId,
        workspaceId,
        expiresAt: { gt: now },
      },
    }),
    
    // Average response time
    db.requestHistory.aggregate({
      where: {
        userId,
        workspaceId,
        expiresAt: { gt: now },
        responseTime: { not: null },
      },
      _avg: {
        responseTime: true,
      },
    }),
  ]);

  return {
    todayCount: totalToday,
    totalCount: totalAll,
    avgResponseTime: avgResponseTime._avg.responseTime || 0,
  };
}
