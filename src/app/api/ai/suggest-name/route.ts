import { suggestRequestName } from "@/lib/ai-agents";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try { 
    const body = await request.json();

    const { workspaceName, method, url, description } = body;

    if (!workspaceName || !method || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await suggestRequestName({
      workspaceName,
      method,
      description,
      url,
    });

    if (!result.success) {
      console.error('❌ AI Agent Failed:', result.error);
      return NextResponse.json(
        { error: result.error || "Failed to suggest name" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
