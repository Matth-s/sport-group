import express from 'express';

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        username: string;
        image: string | undefined | null;
      };
    }
  }
}
