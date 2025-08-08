import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { AuthenticatedRequest } from '../types/type';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({
        error: 'Session expirée',
      });
      return;
    }

    (req as AuthenticatedRequest).user = {
      userId: session.user.id,
      username: session.user.name,
      image: session.user.image,
    };

    next();
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Une erreur serveur est survenue' });
  }
}
