import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Fail-fast startup checks (preserved from original)
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
if (!ACCESS_TOKEN_SECRET) {
  throw new Error('[jwt] JWT_SECRET environment variable is required but not set. Server cannot start.');
}

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!REFRESH_TOKEN_SECRET) {
  throw new Error('[jwt] REFRESH_TOKEN_SECRET environment variable is required but not set. Server cannot start.');
}

// Typed JWT payload for the application
export interface AppJwtPayload {
  sub: string | number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

// Custom error classes for JWT operations
export class JwtError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, JwtError.prototype);
  }
}

export class TokenExpiredError extends JwtError {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

export class InvalidTokenError extends JwtError {
  constructor() {
    super('Invalid token', 'INVALID_TOKEN');
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}

export class TokenTypeError extends JwtError {
  expectedType: string;
  actualType: string;
  constructor(expectedType: string, actualType: string) {
    super(`Token type mismatch: expected '${expectedType}', got '${actualType}'`, 'TOKEN_TYPE_MISMATCH');
    this.expectedType = expectedType;
    this.actualType = actualType;
    Object.setPrototypeOf(this, TokenTypeError.prototype);
  }
}

// Token generation functions with type discrimination
export const generateAccessToken = (payload: object): string => {
  return jwt.sign({ ...payload, type: 'access' }, ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(
    { ...payload, type: 'refresh', jti: Math.random().toString(36).substring(7) },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  );
};

// Token verification functions with typed returns and error handling
export const verifyAccessToken = (token: string): AppJwtPayload => {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (typeof decoded === 'string') {
      throw new InvalidTokenError();
    }
    const payload = decoded as JwtPayload;
    if (payload.type !== 'access') {
      throw new TokenTypeError('access', (payload.type as string) || 'unknown');
    }
    return payload as unknown as AppJwtPayload;
  } catch (error) {
    if (error instanceof JwtError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError();
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): AppJwtPayload => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    if (typeof decoded === 'string') {
      throw new InvalidTokenError();
    }
    const payload = decoded as JwtPayload;
    if (payload.type !== 'refresh') {
      throw new TokenTypeError('refresh', (payload.type as string) || 'unknown');
    }
    return payload as unknown as AppJwtPayload;
  } catch (error) {
    if (error instanceof JwtError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError();
    }
    throw error;
  }
};

// Utility to extract expiration date from a token without verification
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === 'string') {
      return null;
    }
    const payload = decoded as JwtPayload;
    if (typeof payload.exp !== 'number') {
      return null;
    }
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
};
