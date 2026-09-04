import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/config';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ message: 'Forbidden: Invalid token' });
        return;
      }
      req.user = user as { id: number; role: string };
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Requires admin role' });
    return;
  }
};
