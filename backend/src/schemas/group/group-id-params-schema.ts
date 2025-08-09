import { z } from 'zod';

export const groupIdParamsSchema = z.object({
  groupId: z.string().trim().min(1),
});
