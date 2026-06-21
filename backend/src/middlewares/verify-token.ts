import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    next();
  } catch (error) {
    next(error);
  }
};
