import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/type';
import { acceptDeleteRequestSchema } from '../../schemas/group-request/accept-delete-request-schema';
import { getGroupById } from '../../data/group-data';
import { prisma } from '../../lib/prisma';
import { getRequestById } from '../../data/request-group-data';

export const acceptJoinRequestController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    params: { groupId: groupIdParams, requestId: requestIdParams },
    user,
  } = req;

  //verifier les données
  const validatedFields = acceptDeleteRequestSchema.safeParse({
    groupId: groupIdParams,
    requestId: requestIdParams,
  });

  if (!validatedFields.success) {
    return res.status(400).json({
      errors: validatedFields.error.flatten((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  const { requestId, groupId } = validatedFields.data;

  // verifier si la demande existe encore
  const existingRequest = await getRequestById(requestId);

  //si elle n existe pas erreur 404
  if (!existingRequest) {
    return res.status(404).json({
      error: "Cette demande n'existe pas",
    });
  }

  try {
    //supprimer la demande, créer la nouvelle donnée groupMember, créer un chat message

    await prisma.$transaction([
      prisma.joinRequest.delete({
        where: {
          id: requestId,
        },
      }),
      prisma.groupMember.create({
        data: {
          userId: existingRequest.userId,
          groupId,
          role: 'MEMBER',
        },
      }),
      prisma.chatMessage.create({
        data: {
          groupId,
          type: 'INFO',
          content: `${user.username} a accepté ${existingRequest.user.username}`,
        },
      }),
    ]);

    req.app
      .get('io')
      .to(`group-${groupId}`)
      .emit('new-member-accept');

    return res.status(201).json({
      message: `${user.username} fait désormais parti du groupe`,
    });
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
