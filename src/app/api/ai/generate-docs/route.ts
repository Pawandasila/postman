import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { REST_METHOD } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { requestId } = requestBody;

    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    // Fetch request details from database
    const requestData = await db.request.findUnique({
      where: { id: requestId },
      include: {
        collection: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Parse JSON fields
    const parseJsonSafely = (data: unknown): unknown => {
      if (!data) return undefined;
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch {
          return undefined;
        }
      }
      return data;
    };

    const headers = (parseJsonSafely(requestData.headers) || {}) as { [key: string]: unknown };
    const queryParams = (parseJsonSafely(requestData.parameters) || {}) as { [key: string]: unknown };
    const bodyData = parseJsonSafely(requestData.body) as Record<string, unknown> | undefined;

    // Add default headers if not present
    if (!headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (!headers["Accept"] && !headers["accept"]) {
      headers["Accept"] = "application/json";
    }

    // Dynamically import to avoid Turbopack issues
    const { generateApiDocumentation } = await import("@/lib/ai-agents");

    // Generate documentation using AI
    const result = await generateApiDocumentation({
      requestId: requestData.id,
      requestName: requestData.name,
      method: requestData.method as REST_METHOD,
      url: requestData.url,
      headers,
      queryParams,
      body: bodyData,
      collectionName: requestData.collection.name,
      workspaceName: requestData.collection.workspace.name,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate documentation" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      documentation: result.data,
      metadata: {
        requestId: requestData.id,
        requestName: requestData.name,
        collectionName: requestData.collection.name,
        workspaceName: requestData.collection.workspace.name,
        createdAt: requestData.createdAt,
        updatedAt: requestData.updatedAt,
      },
    });
  } catch (err) {
    console.error("❌ Error generating documentation:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
