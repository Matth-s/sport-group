import { MemberRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { Tx } from '../types/type';

export const updateGroupMember = async ({
  tx = prisma,
  userId,
  groupId,
  role,
}: {
  tx: Tx;
  userId: string;
  groupId: string;
  role: MemberRole;
}) => {
  try {
    const userUpdated = await tx.groupMember.update({
      where: {
        userId_groupId: {
          userId: userId,
          groupId,
        },
      },
      data: {
        role: role,
      },
    });

    return userUpdated;
  } catch {
    throw new Error(
      'Une erreur est survenue lors de la modification du membre'
    );
  }
};
