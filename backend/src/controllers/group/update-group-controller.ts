import { Response } from 'express';
import { updateGroupSchema } from '../../schemas/group/update-group-schema';
import { getGroupByName } from '../../data/group-data';
import { AuthenticatedRequest } from '../../types/type';
import { updateGroupById } from '../../services/group-service';

export const updateGroupController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    body,
    params: { groupId },
  } = req;

  const validatedForm = updateGroupSchema.safeParse(body);

  if (!validatedForm.success) {
    return res.status(400).json({
      error: 'Formulaire invalide',
    });
  }

  const { name } = validatedForm.data;

  //si le groupe existe et que le groupId correspond alors le nom du groupe n'est pas utilisé
  const existingGroupName = await getGroupByName(name);

  if (existingGroupName && existingGroupName.id !== groupId) {
    return res.status(409).json({
      error: 'Ce nom de groupe est déjà utilisé',
    });
  }

  try {
    const updatedGroup = await updateGroupById(validatedForm.data);

    return res.status(201).json(updatedGroup);
  } catch {
    return res.status(500).json({
      error: 'Une erreur serveur est survenue',
    });
  }
};
