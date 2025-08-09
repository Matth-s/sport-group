import { Group } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const getGroupByName = async (
  name: string
): Promise<Group | null> => {
  try {
    const existingGroup = await prisma.group.findUnique({
      where: {
        name,
      },
    });

    return existingGroup;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};

export const getGroupByIdWithModerator = async (id: string) => {
  try {
    const existingGroup = await prisma.group.findUnique({
      where: {
        id,
      },
      include: {
        members: {
          where: {
            role: 'MODERATOR',
          },
        },
      },
    });

    return existingGroup;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};

export const isModeratorOrAdmin = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}): Promise<boolean> => {
  try {
    const existingGroup = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
        OR: [
          {
            role: 'MODERATOR',
          },
          {
            role: 'ADMIN',
          },
        ],
      },
    });

    return !!existingGroup;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};

export const getGroupById = async (
  id: string
): Promise<Group | null> => {
  try {
    const existingGroup = await prisma.group.findUnique({
      where: { id },
    });

    return existingGroup;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};

export const isUserBannedByUserIdAndGroupId = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}): Promise<boolean> => {
  try {
    const userBanned = await prisma.memberBanned.findUnique({
      where: {
        groupId_userId: {
          userId,
          groupId,
        },
      },
    });

    return !!userBanned;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};

export const isUserInGroup = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}): Promise<boolean> => {
  try {
    const findUser = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    return !!findUser;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};

export const getJoinRequest = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) => {
  try {
    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    return existingRequest;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};
