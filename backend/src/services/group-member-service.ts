import { GroupMember, MemberRole } from '@prisma/client';
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

export const newGroupMember = async ({
  member,
  tx,
}: {
  member: Omit<GroupMember, 'joinedAt' | 'id'>;
  tx: Tx;
}) => {
  try {
    const newGroupMember = await tx.groupMember.create({
      data: {
        ...member,
      },
    });

    return newGroupMember;
  } catch {
    throw new Error('Une erreur survenue lors de l ajout du member');
  }
};
