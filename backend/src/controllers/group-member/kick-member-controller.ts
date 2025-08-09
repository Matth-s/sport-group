import { NextFunction, Response } from 'express';
import { AuthenticatedRequest, Tx } from '../../types/type';
import { z } from 'zod';
import { getGroupMemberAndUsername } from '../../data/group-member-data';
import { canKickMember } from '../../utils/role-util';
import { prisma } from '../../lib/prisma';
import { deleteGroupMemberById } from '../../services/group-member-service';
import { newGroupMessage } from '../../services/group-message-service';

const validatedParamsSchema = z.object({
  groupId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
});

export const kickMemberController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    user,
    params: { groupId: groupIdParams, userId: userIdParams },
  } = req;

  const validatedParams = validatedParamsSchema.safeParse({
    groupId: groupIdParams,
    userId: userIdParams,
  });

  if (!validatedParams.success) {
    return res.status(400).json({
      error: 'Paramètres invalide',
    });
  }

  const { groupId, userId } = validatedParams.data;

  const existingMember = await getGroupMemberAndUsername({
    groupId,
    userId,
  });

  if (!existingMember) {
    return res.status(404).json({
      message: 'Ce membre ne fait pas partie de ce groupe',
    });
  }

  const currentMember = await getGroupMemberAndUsername({
    groupId,
    userId: user.userId,
  });

  if (!currentMember) {
    return res.status(401).json({
      error: 'Vous ne faites pas parti de ce groupe',
    });
  }

  const canKickUser = canKickMember({
    currentUserRole: currentMember.role,
    targetRole: existingMember.role,
  });

  if (!canKickUser) {
    return res.status(403).json({
      error: "Vous n'avez pas les droits",
    });
  }

  try {
    await prisma.$transaction(async (tx: Tx) => {
      //remove member
      await deleteGroupMemberById({ tx, id: existingMember.id });
      await newGroupMessage({
        tx,
        message: {
          groupId,
          userId: null,
          type: 'INFO',
          content: `${currentMember.user.username} a expulsé ${existingMember.user.username}`,
          replyTo: null,
        },
      });
    });

    req.app.get('io').to(`group-${groupId}`).emit('member-kicked');

    return res.status(200).json({
      message: `L'utilisateur ${existingMember.user.username} a été expulsé `,
    });
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
