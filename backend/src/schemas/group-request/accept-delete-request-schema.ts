import { z } from 'zod';

export const acceptDeleteRequestSchema = z.object({
  groupId: z.string().min(1),
  requestId: z.string().min(1),
});
