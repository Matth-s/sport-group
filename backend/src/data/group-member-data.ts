import { prisma } from '../lib/prisma';

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
