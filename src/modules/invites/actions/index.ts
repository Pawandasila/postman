"use server";
import db from "@/lib/db";
import { currentUser } from "@/modules/Authentication/actions";
import { MEMBER_ROLE } from "@prisma/client";
import { randomBytes } from "crypto";

export const generateWorkspaceInvite = async (workspaceId: string) => {
  const token = randomBytes(16).toString("hex");

  const user = await currentUser();

  if (!user) {
    return {
      success: false,
      message: "You must be signed in to create an invite",
    };
  }

  try {
    const invite = await db.workspaceInvite.create({
      data: {
        token,
        workspaceId,
        createdById: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;
    
    return {
      success: true,
      inviteUrl,
      message: "Invite link created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create invite link",
    };
  }
};

export const acceptWorkspaceInvite = async (token: string) => {
  const user = await currentUser();

  if (!user) {
    return {
      success: false,
      message: "You must be signed in to accept an invite",
    };
  }

  const invite = await db.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite) {
    return {
      success: false,
      message: "Invalid invite token",
    };
  }

  if (!invite.expiresAt || invite.expiresAt < new Date()) {
    return {
      success: false,
      message: "Invite token has expired",
    };
  }

  await db.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: invite.workspaceId,
      },
    },
    create: {
      userId: user.id,
      workspaceId: invite.workspaceId,
      role: MEMBER_ROLE.VIEWER,
    },
    update: {},
  });

  await db.workspaceInvite.delete({
    where: { id: invite.id },
  });

  return {
    success: true,
    message: "You have successfully accepted the invite",
  };
};

export const getAllWorkspaceMembers = async (workspaceId: string) => {
  return await db.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
  });
};


export async function detectWheatherUserIsInvited(userId: string, workspaceId: string) {
  try {
    
    const existingMember = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        },
      },
    });

    if (existingMember) {
      return {
        success: true,
        isInvited: false,
        isMember: true,
        message: "User is already a member of this workspace",
        memberRole: existingMember.role,
      };
    }

    
    const pendingInvites = await db.workspaceInvite.findMany({
      where: {
        workspaceId: workspaceId,
        expiresAt: {
          gt: new Date(), 
        },
      },
      include: {
        workspace: true,
        createdBy: true,
      },
    });

    if (pendingInvites.length > 0) {
      return {
        success: true,
        isInvited: true,
        isMember: false,
        message: "User has pending invites for this workspace",
        inviteCount: pendingInvites.length,
        invites: pendingInvites.map(invite => ({
          id: invite.id,
          token: invite.token,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
          createdBy: invite.createdBy.name || invite.createdBy.email,
        })),
      };
    }

    return {
      success: true,
      isInvited: false,
      isMember: false,
      message: "User is not invited and not a member of this workspace",
    };

  } catch (error) {
    console.error("Error detecting user invite status:", error);
    return {
      success: false,
      message: "Failed to check user invite status",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}