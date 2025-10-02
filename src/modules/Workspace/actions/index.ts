"use server";

import db from "@/lib/db";
import { currentUser } from "@/modules/Authentication/actions";
import { MEMBER_ROLE } from "@prisma/client";

export const initWorkSpace = async () => {
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  try {
    const workspace = await db.workspace.upsert({
      where: {
        name_ownerId: {
          ownerId: user.id,
          name: "Personal Workspace",
        },
      },
      update: {},
      create: {
        name: "Personal Workspace",
        description: "Default workspace for personal use",
        ownerId: user.id,
        members: {
          create: {
            userId: user?.id,
            role: MEMBER_ROLE.ADMIN,
          },
        },
      },
      include: {
        members: true,
      },
    });

    return {
      success: true,
      workspace,
    };
  } catch (error) {
    console.error("Error initializing workspace:", error);
    return {
      success: false,
      message: "Failed to initialize workspace",
    };
  }
};

export async function getWorkspaces() {
  const user = await currentUser();

  if (!user) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  const workspaces = await db.workspace.findMany({
    where: {
      OR: [
        {
          ownerId: user.id,
        },
        {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    workspaces,
  };
}

export async function createWorkspace(name: string, description?: string) {
  const user = await currentUser();

  if (!user) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  const workspace = await db.workspace.create({
    data: {
      name: name,
      description: description || "",
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: MEMBER_ROLE.ADMIN,
        },
      },
    },
  });

  return {
    success: true,
    workspace,
  };
}

export async function getWorkspaceById(workspaceId: string) {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true,
    },
  });

  return workspace;
}
