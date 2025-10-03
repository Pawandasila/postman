import { NextRequest, NextResponse } from "next/server";
import { getUserRequestHistoryGrouped, getUserHistoryStats, clearUserHistory } from "@/lib/request-history";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    // Get grouped history and stats
    const [history, stats] = await Promise.all([
      getUserRequestHistoryGrouped(session.user.id, workspaceId || undefined),
      getUserHistoryStats(session.user.id, workspaceId || undefined),
    ]);

    return NextResponse.json({
      history,
      stats,
    });
  } catch (error) {
    console.error("Error fetching request history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    await clearUserHistory(session.user.id, workspaceId || undefined);

    return NextResponse.json({
      success: true,
      message: "History cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing request history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
