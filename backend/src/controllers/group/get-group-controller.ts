import { Request, Response } from 'express';

export const getGroupController = async (
  req: Request,
  res: Response
) => {
  try {
  } catch {
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};
