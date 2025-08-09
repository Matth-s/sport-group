import { Response } from 'express';
import { AuthenticatedRequest, Tx } from '../../types/type';
import { acceptDeleteRequestSchema } from '../../schemas/group-request/accept-delete-request-schema';
import { prisma } from '../../lib/prisma';
import { getRequestById } from '../../data/request-group-data';
import { deleteJoinRequest } from '../../services/group-request-services';
import { newGroupMember } from '../../services/group-member-service';
import { newGroupMessage } from '../../services/group-message-service';

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

    await prisma.$transaction(async (tx: Tx) => {
      //supprimer la requete de demande
      await deleteJoinRequest({ id: requestId, tx });
      //ajouter le membre au groupe
      await newGroupMember({
        tx,
        member: {
          userId: existingRequest.userId,
          groupId,
          role: 'MEMBER',
        },
      });
      //créer un message avec la venu d un nouvel utilisateur
      await newGroupMessage({
        tx,
        message: {
          groupId,
          type: 'INFO',
          content: `${user.username} a accepté ${existingRequest.user.username}`,
          replyTo: null,
          userId: null,
        },
      });
    });

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
