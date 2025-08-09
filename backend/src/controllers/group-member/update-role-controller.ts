import { Response } from 'express';
import { AuthenticatedRequest, Tx } from '../../types/type';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { MemberRole } from '@prisma/client';
import { getGroupMemberAndUsername } from '../../data/group-member-data';
import { updateGroupMember } from '../../services/group-member-service';
import { newGroupMessage } from '../../services/group-message-service';
import { canUpdateRole } from '../../utils/role-util';

const paramsSchema = z.object({
  groupId: z.string().trim().min(1),
  userIdToUpdate: z.string().trim().min(1),
  newRole: z.nativeEnum(MemberRole),
});

export const updateRoleController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    user,
    params: { groupId: groupIdParams },
    body,
  } = req;

  const validatedFields = paramsSchema.safeParse({
    groupId: groupIdParams,
    ...body,
  });

  if (!validatedFields.success) {
    return res.status(400).json({
      error: 'Requête invalide',
    });
  }

  const { userIdToUpdate, groupId, newRole } = validatedFields.data;

  const userTarget = await getGroupMemberAndUsername({
    groupId,
    userId: userIdToUpdate,
  });

  //recuperer le role de l utilisateur actuel
  const currentUser = await getGroupMemberAndUsername({
    groupId,
    userId: user.userId,
  });

  if (!currentUser) {
    return res
      .status(403)
      .json({ error: "Vous n'êtes pas membre de ce groupe" });
  }
  if (!userTarget) {
    return res.status(404).json({
      error: 'Cet utilisateur ne fait pas partie du groupe',
    });
  }

  //si le current user est membre alors il ne peut rien faire
  if (!canUpdateRole(currentUser.role, userTarget.role, newRole)) {
    return res.status(403).json({
      error: "Vous n'avez pas les droits pour effectuer cette action",
    });
  }

  try {
    await prisma.$transaction(async (tx: Tx) => {
      if (
        currentUser.role === 'MODERATOR' &&
        newRole === 'MODERATOR'
      ) {
        await updateGroupMember({
          tx,
          userId: user.userId,
          groupId,
          role: 'ADMIN',
        });
        await updateGroupMember({
          tx,
          userId: userTarget.userId,
          groupId,
          role: 'MODERATOR',
        });
        await newGroupMessage({
          tx,
          message: {
            groupId,
            type: 'INFO',
            content: `${userTarget.user.username} est désormais modérateur`,
            replyTo: null,
            userId: null,
          },
        });
      } else {
        await updateGroupMember({
          tx,
          userId: userTarget.userId,
          groupId,
          role: newRole,
        });
        await newGroupMessage({
          tx,
          message: {
            groupId,
            type: 'INFO',
            content: `${userTarget.user.username} a un nouveau rôle`,
            replyTo: null,
            userId: null,
          },
        });
      }
    });

    req.app.get('io').to(`group-${groupId}`).emit('new-role');

    return res.status(201).json({
      message: `${userTarget.user.username} a un nouveau role`,
    });
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
