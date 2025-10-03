import { generateJsonBody } from "@/lib/ai-agents";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { prompt, method, endpoint, context } = body;

    if (!prompt || !method || !endpoint) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await generateJsonBody({
      prompt,
      method,
      endpoint,
      context,
    });

    console.log('🔍 AI Agent Result (JSON):', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error('❌ AI Agent Failed:', result.error);
      return NextResponse.json(
        { error: result.error || "Failed to generate JSON body" },
        { status: 500 }
      );
    }

    // result.data already contains { jsonBody: {...}, description, reasoning }
    console.log('✅ Returning JSON body:', result.data);
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
