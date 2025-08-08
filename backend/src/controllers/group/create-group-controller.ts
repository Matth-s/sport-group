import { Response } from 'express';
import { newGroupSchema } from '../../schemas/group/new-group-schema';
import { getGroupByName } from '../../data/group-data';
import { prisma } from '../../lib/prisma';
import { AuthenticatedRequest } from '../../types/type';

export const createGroupController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { body, user } = req;

  const validatedForm = newGroupSchema.safeParse(body);

  if (!validatedForm.success) {
    return res.status(400).json({
      error: 'Invalid form data',
    });
  }

  const { name, joinMode, location, sportPracticed } =
    validatedForm.data;

  const existingGroup = await getGroupByName(name);

  if (existingGroup) {
    return res.status(409).json({
      error: 'Ce nom de groupe est déjà utilisé',
    });
  }

  try {
    const groupSaved = await prisma.group.create({
      data: {
        name,
        joinMode,
        location,
        sportPracticed,
        members: {
          create: {
            userId: user.userId,
          },
        },
      },
    });

    return res.status(201).json(groupSaved);
  } catch {
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};
