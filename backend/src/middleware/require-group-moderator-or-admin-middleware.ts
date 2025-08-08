import { NextFunction, Request, Response } from 'express';
import { isModeratorOrAdmin } from '../data/group-data';

export const requiredGroupModeratorOrAdmin = async (
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
  const isUserModeratorOrAdmin = await isModeratorOrAdmin({
    groupId,
    userId: user.userId,
  });

  if (!isUserModeratorOrAdmin) {
    return res.status(401).json({
      error: 'Non autorisé',
    });
  }

  next();
};
