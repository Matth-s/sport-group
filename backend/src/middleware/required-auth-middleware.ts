import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        error: 'Session expiré',
      });
    }

    req.user = {
      userId: session.user.id,
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
