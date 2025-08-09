import { Request, Response } from 'express';
import { z } from 'zod';
import { groupTypeEnum } from '../../schemas/group/group-enums';
import { prisma } from '../../lib/prisma';

const querySchema = z.object({
  nom: z.string().trim().optional(),
  groupe: z.enum(['mes-groupes', 'groupes-rejoint']).optional(),
  statut: groupTypeEnum.optional(),
  sport: z.string().trim().optional(),
});

export const getGroupController = async (
  req: Request,
  res: Response
) => {
  const { user } = req;

  const validatedQuery = querySchema.safeParse(req.query);

  if (!validatedQuery.success) {
    return res.status(400).json({ error: 'Requête invalide' });
  }

  const { nom, groupe, statut, sport } = validatedQuery.data;

  const filters: any = {};

  if (nom) {
    filters.name = {
      contains: nom,
      mode: 'insensitive',
    };
  }

  if (statut) {
    filters.statut = statut;
  }

  if (sport) {
    filters.sportPracticed = {
      contains: sport,
      mode: 'insensitive',
    };
  }

  //   Si groupe = mes-groupes → groupes où user est créateur

  if (user?.userId) {
    if (groupe === 'mes-groupes') {
      filters.member = { userId: user.userId, role: 'MODERATOR' };
    }

    //   Si groupe = grouprejoint → groupes où user est membre
    if (groupe === 'groupes-rejoint') {
      filters.members = {
        some: {
          userId: user.userId,
        },
        role: {
          not: 'MODERATOR',
        },
      };
    }
  }

  console.log(filters);

  const groups = await prisma.group.findMany({
    where: filters,
    include: {
      members: true,
    },
  });

  res.json(groups);
};
