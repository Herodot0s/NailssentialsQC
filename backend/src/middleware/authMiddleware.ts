import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { verifyAccessToken, AppJwtPayload } from '../utils/jwt';

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
      error: { code: 'TOKEN_REQUIRED', message: 'Access token required' },
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
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

export const validateZod = (schema: z.ZodSchema) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: result.error.flatten(),
        },
      });
    }
    req.validatedBody = result.data as Record<string, any>;
    next();
  };
};
