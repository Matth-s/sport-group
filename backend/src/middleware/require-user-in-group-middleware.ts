import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/type';
import { groupIdParamsSchema } from '../schemas/group/group-id-params-schema';
import { isUserInGroup } from '../data/group-data';

export const requireUserInGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    user,
    params: { groupId: groupIdParams },
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

  const existingUser = await isUserInGroup({
    groupId,
    userId: user.userId,
  });

  if (!existingUser) {
    return res.status(401).json({
      error: 'Non autorisé',
    });
  }

  next();
};
