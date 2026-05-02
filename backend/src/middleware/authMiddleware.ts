import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt';

interface AppJwtPayload extends JwtPayload {
  sub: string | number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AppJwtPayload;
  validatedParams?: Record<string, any>;
  validatedBody?: Record<string, any>;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'ACCESS_DENIED', message: 'Access token required' },
    });
  }

  try {
    const decoded = verifyAccessToken(token) as unknown as AppJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired access token' },
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You do not have permission to perform this action' },
      });
    }
    next();
  };
};
