import { NextResponse } from "next/server";
import db from "@/lib/db";
import { currentUser } from "@/modules/Authentication/actions";

/**
 * One-time setup endpoint to make the first user an admin
 * This should be removed or secured after initial setup
 */
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User role updated to ADMIN",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Make admin error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}
