import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/type';
import { getJoinRequest } from '../../data/group-data';
import { deleteJoinRequest } from '../../services/group-request-services';

export const deleteJoinRequestController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    params: { groupId },
    user,
  } = req;

  if (!groupId || typeof groupId !== 'string') {
    return res.status(400).json({
      error: 'GroupId invalide',
    });
  }

  const existingJoinRequest = await getJoinRequest({
    groupId,
    userId: user.userId,
  });

  if (!existingJoinRequest) {
    return res.status(404).json({
      error: "La demande n'a pas pu être trouvée",
    });
  }

  try {
    await deleteJoinRequest({
      id: existingJoinRequest.id,
    });

    req.app
      .get('io')
      .to(`group-${groupId}`)
      .emit('delete-join-request');

    return res.status(200).json({
      message: "La demande d'adhésion a été supprimée",
    });
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
