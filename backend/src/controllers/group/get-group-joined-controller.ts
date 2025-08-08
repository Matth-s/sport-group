import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthenticatedRequest } from '../../types/type';

export const getGroupJoinedController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { user } = req;

  try {
    const joinedGroup = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: user.userId,
          },
        },
      },
    });

    return res.status(200).json(joinedGroup);
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
