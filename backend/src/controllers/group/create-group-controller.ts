import { Response } from 'express';
import { newGroupSchema } from '../../schemas/group/new-group-schema';
import { getGroupByName } from '../../data/group-data';
import { AuthenticatedRequest } from '../../types/type';
import { createGroup } from '../../services/group-service';

export const createGroupController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { body, user } = req;

  const validatedFields = newGroupSchema.safeParse(body);

  if (!validatedFields.success) {
    return res.status(400).json(
      validatedFields.error.flatten((error) => ({
        message: error.message,
        field: error.path,
      }))
    );
  }

  const { name } = validatedFields.data;

  const existingGroup = await getGroupByName(name);

  if (existingGroup) {
    return res.status(409).json({
      error: 'Ce nom de groupe est déjà utilisé',
    });
  }

  try {
    const groupSaved = await createGroup({
      group: validatedFields.data,
      userId: user.userId,
    });

    req.app.get('io').emit('group', {
      ...groupSaved,
    });

    return res.status(201).json(groupSaved);
  } catch {
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};
