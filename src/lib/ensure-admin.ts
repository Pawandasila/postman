import db from "@/lib/db";
import { env } from "@/lib/env";

export async function ensureAdminRole(userId: string, email: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL;
    
    if (!adminEmail || email !== adminEmail) {
      return;
    }

    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === "ADMIN") {
      return; 
    }

    
    await db.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    });

    console.log(`✅ User ${email} promoted to ADMIN`);
  } catch (error) {
    console.error("Error ensuring admin role:", error);
    
  }
}
