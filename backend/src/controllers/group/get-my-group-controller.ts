import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthenticatedRequest } from '../../types/type';

export const getMyGroupController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { user } = req;

  try {
    const findGroup = await prisma.group.findMany({
      where: {
        members: {
          some: {
            role: 'MODERATOR',
            userId: user.userId,
          },
        },
      },
    });

    return res.status(200).json(findGroup);
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
