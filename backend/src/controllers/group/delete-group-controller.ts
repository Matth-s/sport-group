import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/type';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const paramsSchema = z.object({
  groupId: z.string().trim().min(1),
});

export const deleteGroupController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  //ici l'utilisateur est forcément le modérateur avec la verification du middleware

  const {
    params: { groupId: groupIdParams },
    user,
  } = req;

  const validatedFields = paramsSchema.safeParse({
    groupId: groupIdParams,
  });

  if (!validatedFields.success) {
    return res.status(400).json({
      error: 'Requête invalide',
    });
  }

  const { groupId } = validatedFields.data;

  //recuperer le group avec les membres sauf le moderateur
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

  //s il y a d autres membres retourner une erreur 403
  if (!groupMembers || groupMembers?.members?.length > 0) {
    return res.status(403).json({
      error:
        'Vous ne pouvez pas supprimer un groupe avec des membres',
    });
  }

  try {
    await prisma.group.delete({
      where: {
        id: groupId,
        members: {
          some: {
            userId: user.userId,
            role: 'MODERATOR',
          },
        },
      },
    });

    return res.status(200).json({
      message: 'Le groupe a été supprimé avec succès',
    });
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }

  //si l utilisateur actuel
};
