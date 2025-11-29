"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { ensureAdminRole } from "@/lib/ensure-admin";

export const currentUser = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user) {
      await ensureAdminRole(user.id, user.email);
      
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && user.email === adminEmail && user.role !== "ADMIN") {
        return await db.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }
    }

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};
