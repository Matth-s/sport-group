import { ChatMessage, ChatType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { Tx } from '../types/type';

export const postGroupMessage = async ({
  tx = prisma,
  groupId,
  userId = null,
  type,
  content,
  replyTo = null,
}: {
  tx: Tx;
  userId?: string | null;
  groupId: string;
  type: ChatType;
  content: string;
  replyTo?: string | null;
}) => {
  try {
    const savedMessage = await tx.chatMessage.create({
      data: {
        groupId,
        userId,
        content,
        type,
        replyTo,
      },
    });

    return savedMessage;
  } catch {
    throw new Error(
      "Une erreur est survenue lors de l'envoie du message"
    );
  }
};
