import { prisma } from '../lib/prisma';

export const getJoinRequestById = async (id: string) => {
  try {
    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return existingRequest;
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
