import { ChatMessage } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { Tx } from '../types/type';

export const newGroupMessage = async ({
  tx = prisma,
  message,
}: {
  tx: Tx;
  message: Omit<
    ChatMessage,
    'id' | 'sendedAt' | 'hasBeenModified' | 'modifiedAt'
  >;
}) => {
  try {
    const savedMessage = await tx.chatMessage.create({
      data: {
        ...message,
      },
    });

    return savedMessage;
  } catch {
    throw new Error(
      "Une erreur est survenue lors de l'envoie du message"
    );
  }
};
