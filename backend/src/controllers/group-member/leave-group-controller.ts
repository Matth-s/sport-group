import { Response } from 'express';
import { AuthenticatedRequest, Tx } from '../../types/type';
import { groupIdParamsSchema } from '../../schemas/group/group-id-params-schema';
import {
  getGroupMemberAndUsername,
  getGroupMemberWithOutModerator,
} from '../../data/group-member-data';
import { prisma } from '../../lib/prisma';
import { deleteGroupMemberById } from '../../services/group-member-service';
import { newGroupMessage } from '../../services/group-message-service';
import { deleteGroupById } from '../../services/group-service';

export const leaveGroupController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    params: { groupId: groupIdParams },
    user,
  } = req;

  const validatedParams = groupIdParamsSchema.safeParse({
    groupId: groupIdParams,
  });

  if (!validatedParams.success) {
    return res.status(400).json({
      error: 'Groupe id invalide',
    });
  }

  const { groupId } = validatedParams.data;

  const existingMember = await getGroupMemberAndUsername({
    groupId,
    userId: user.userId,
  });

  try {
    await prisma.$transaction(async (tx: Tx) => {
      // si l utilisateur est admin ou membre
      if (existingMember?.role !== 'MODERATOR') {
        // supprimer l utilisateur
        await deleteGroupMemberById({
          tx,
          id: groupId,
        });

        //envoyer un  message dans le tchat
        await newGroupMessage({
          tx,
          message: {
            groupId,
            type: 'INFO',
            content: `${existingMember?.user.username} a quitté le groupe`,
            userId: null,
            replyTo: null,
          },
        });

        req.app.get('io').to(`group-${groupId}`).emit('member');

        return res.status(200).json({
          message: 'Vous avez quitté le groupe',
        });
      } else {
        // si l utilisateur est admin
        const memberList =
          await getGroupMemberWithOutModerator(groupId);

        // s il y a encore des membres dans le groupe retourner une 403
        if (memberList && memberList?.members.length > 0) {
          return res.status(403).json({
            error:
              "Vous ne pouvez pas quitter le groupe s'il reste des membres",
          });
        }

        //supprimer le groupe

        await deleteGroupById(groupId);

        //envoye un emit pour les groupes appartement
        req.app.get('io').to(`user-${user.userId}`).emit('group');

        return res.status(200).json({
          message: 'Vous avez quitté le groupe',
        });
      }
    });
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
