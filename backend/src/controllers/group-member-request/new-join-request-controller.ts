import { Response } from 'express';
import { newJoinRequestSchema } from '../../schemas/group/new-join-request-controller';
import {
  getGroupById,
  isUserBannedByUserIdAndGroupId,
  isUserInGroup,
  isUserInGroupRequest,
} from '../../data/group-data';
import { prisma } from '../../lib/prisma';
import { AuthenticatedRequest } from '../../types/type';

export const newJoinRequestController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    params: { groupId: groupIdParams },
    user,
  } = req;

  const validatedFields = newJoinRequestSchema.safeParse({
    userId: user.userId,
    groupId: groupIdParams,
  });

  if (!validatedFields.success) {
    return res.status(400).json({
      errors: validatedFields.error.flatten((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  const { groupId, userId } = validatedFields.data;

  //verifier si le groupe existe
  const existingGroup = await getGroupById(groupId);

  //s il nexiste pas retourner une erreur 404 not found
  if (!existingGroup) {
    return res.status(404).json({
      error: "Ce groupe n'existe pas",
    });
  }

  //si le groupe est fermer retourne une erreur 403 groupe fermé
  if (existingGroup.joinMode === 'PRIVATE') {
    return res.status(403).json({
      message: 'Ce groupe est actuellement fermé',
    });
  }

  // verifier si l utilisateur a été banni du groupe
  const isUserBanned = await isUserBannedByUserIdAndGroupId({
    groupId,
    userId,
  });

  if (isUserBanned) {
    return res.status(403).json({
      error: 'Vous avez été banni de ce groupe',
    });
  }

  // verifier si l utilisateur fait deja parti du groupe
  const isUserAlreadyInGroup = await isUserInGroup({
    groupId,
    userId,
  });

  if (isUserAlreadyInGroup) {
    return res.status(200).json({
      message: 'Vous faites déjà membre de ce groupe',
    });
  }

  try {
    //si le groupe est ouvert ajouter directement en membre
    if (existingGroup.joinMode === 'PUBLIC') {
      await prisma.$transaction([
        prisma.groupMember.create({
          data: {
            userId,
            groupId,
            role: 'MEMBER',
          },
        }),
        prisma.chatMessage.create({
          data: {
            groupId,
            content: `${user.username} à rejoint le groupe`,
            type: 'INFO',
          },
        }),
      ]);

      req.app
        .get('io')
        .to(`group-${groupId}`)
        .emit('new-join-request');

      return res.status(201).json({
        message: `Vous faites désormais par du groupe ${existingGroup.name}`,
        data: {
          groupId: existingGroup.id,
        },
      });
    }

    //faire une demande d adhesion
    if (existingGroup.joinMode === 'INVITATION') {
      //verifier s il existe deja une demande
      const existingRequest = await isUserInGroupRequest({
        groupId,
        userId,
      });

      if (existingRequest) {
        return res.status(200).json({
          message: "Une demande d'adhésion est déjà en cours",
        });
      }
      await prisma.joinRequest.create({
        data: {
          userId,
          groupId,
        },
      });
    }

    return res.status(201).json({
      message: 'Votre demande à été envoyé',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
