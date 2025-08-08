import { z } from 'zod';

export const newJoinRequestSchema = z.object({
  userId: z.string().trim().min(1, {
    message: 'UserId invalide',
  }),
  groupId: z.string().trim().min(1, {
    message: 'GroupId invalide',
  }),
});
