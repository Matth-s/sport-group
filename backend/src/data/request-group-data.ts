import { prisma } from '../lib/prisma';

export const getRequestById = async (id: string) => {
  try {
    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return existingRequest;
  } catch {
    throw new Error('Une erreur est survenue');
  }
};
