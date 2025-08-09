import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/type';
import { z } from 'zod';
import { getJoinRequestById } from '../../data/request-group-data';
import { deleteJoinRequest } from '../../services/group-request-service';

const paramsSchema = z.object({
  requestId: z.string().trim().min(1),
  groupId: z.string().trim().min(1),
});

export const deleteJoinRequestController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    params: { requestIdParams, groupIdParams },
  } = req;

  const validatedParams = paramsSchema.safeParse({
    requestId: requestIdParams,
    groupId: groupIdParams,
  });

  if (!validatedParams.success) {
    return res.status(400).json({
      error: 'Requête invalide',
    });
  }

  const { groupId, requestId } = validatedParams.data;

  const existingJoinRequest = await getJoinRequestById(requestId);

  if (!existingJoinRequest) {
    return res.status(200).json({
      message: 'La demande à été retiré',
    });
  }

  try {
    await deleteJoinRequest({
      id: existingJoinRequest.id,
    });

    req.app.get('io').to(`group-${groupId}`).emit('request');

    return res.status(200).json({
      message: 'La demande à été retiré',
    });
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
