import { JoinRequest } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { Tx } from '../types/type';

export const deleteJoinRequest = async ({
  id,
  tx = prisma,
}: {
  id: string;
  tx?: Tx;
}) => {
  try {
    await tx.joinRequest.delete({
      where: {
        id,
      },
    });
  } catch {
    throw new Error(
      'Une erreur est survenue lors de la suppression de la demande'
    );
  }
};

export const createJoinRequest = async (
  request: Omit<JoinRequest, 'createdAt' | 'id'>
) => {
  try {
    const savedRequest = await prisma.joinRequest.create({
      data: {
        ...request,
      },
    });

    return savedRequest;
  } catch {
    throw new Error('Une erreur est survenue lors de la demande');
  }
};
