import { Request } from 'express';

export interface AuthenticatedRequest<
  P = Record<string, any>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user: {
    userId: string;
    username: string;
    image: string | null | undefined;
  };
}
