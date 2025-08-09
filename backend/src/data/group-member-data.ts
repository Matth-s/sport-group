import { prisma } from '../lib/prisma';

export const getGroupMember = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) => {
  try {
    const existingMember = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    return existingMember;
  } catch {
    throw new Error(
      'Une erreur est survenue lors de la recupération du membre'
    );
  }
};

export const getGroupMemberAndUsername = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) => {
  try {
    const existingUser = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          groupId,
          userId: userId,
        },
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return existingUser;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};

export const getGroupMemberWithOutModerator = async (
  groupId: string
) => {
  try {
    const groupMembers = await prisma.group.findFirst({
      where: {
        id: groupId,
      },
      select: {
        members: {
          where: {
            role: {
              notIn: ['MODERATOR'],
            },
          },
        },
      },
    });

    return groupMembers;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};
