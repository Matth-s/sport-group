import { Group } from '@prisma/client';
import { prisma } from '../lib/prisma';

//créer le group avec l utilisateur moderateur
export const createGroup = async ({
  group,
  userId,
}: {
  group: Omit<Group, 'id' | 'createdAt'>;
  userId: string;
}) => {
  try {
    const groupSaved = await prisma.group.create({
      data: {
        ...group,
        members: {
          create: {
            userId,
            role: 'MODERATOR',
          },
        },
      },
    });

    return groupSaved;
  } catch {
    throw new Error(
      'Une erreur est survenue lors de la création du group'
    );
  }
};

//delete group by id
export const deleteGroupById = async (id: string): Promise<void> => {
  try {
    await prisma.group.delete({
      where: {
        id,
      },
    });
  } catch {
    throw new Error(
      'Une erreur est survenue lors de la suppression du groupe'
    );
  }
};

//update group

export const updateGroupById = async (group: Group) => {
  const { id, ...rest } = group;
  try {
    const updatedGroup = await prisma.group.update({
      where: {
        id: group.id,
      },
      data: {
        ...rest,
      },
    });
  } catch {
    throw new Error(
      'Une erreur est survenue lors de la mise à jour du groupe'
    );
  }
};
