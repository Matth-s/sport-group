import { z } from 'zod';
import { groupTypeEnum, sportPracticedEnum } from './group-enums';

export const updateGroupSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(3, {
      message:
        'Le nom du groupe doit avoir une longueur minimum de 3 caractères',
    })
    .max(30, {
      message:
        'Le nom du groupe doit avoir une longueur minimum de 30 caractères',
    }),
  location: z.string().trim().nullable(),
  joinMode: groupTypeEnum,
  sportPracticed: sportPracticedEnum.optional().default([]),
  createdAt: z.date(),
});
