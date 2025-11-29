import { NextResponse } from "next/server";
import db from "@/lib/db";
import { currentUser } from "@/modules/Authentication/actions";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Get user stats
    const [
      totalUsers,
      totalWorkspaces,
      totalCollections,
      totalRequests,
      totalRequestHistory,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.workspace.count(),
      db.collection.count(),
      db.request.count(),
      db.requestHistory.count(),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          image: true,
          role: true,
        },
      }),
    ]);

    // Get users by auth method
    const authMethodStats = await db.account.groupBy({
      by: ["providerId"],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalWorkspaces,
        totalCollections,
        totalRequests,
        totalRequestHistory,
        authMethods: authMethodStats,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
