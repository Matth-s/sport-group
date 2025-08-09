import { Prisma } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    image: string | undefined | null;
  };
}

export type Tx = Prisma.TransactionClient;
