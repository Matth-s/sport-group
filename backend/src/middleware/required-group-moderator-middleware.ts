import { NextFunction, Request, Response } from 'express';
import { getGroupByIdWithModerator } from '../data/group-data';

export const requiredGroupModerator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  const groupId = req.params.groupId;

  // verifie si le groupId est present avec le bon type
  if (!groupId || typeof groupId !== 'string') {
    return res.status(400).json({
      error: 'Groupe id invalide',
    });
  }

  //recuperer le group avec l id
  const existingGroup = await getGroupByIdWithModerator(groupId);

  if (!existingGroup) {
    return res.status(404).json({
      error: "Ce groupe n'existe pas",
    });
  }

  //verifier si l acteur de la requete n'est pas admin erreur 403
  if (existingGroup.members[0].userId !== user?.userId) {
    return res.status(403).json({
      error: "Vous n'avez pas les droits pour effectuer cette action",
    });
  }

  next();
};
