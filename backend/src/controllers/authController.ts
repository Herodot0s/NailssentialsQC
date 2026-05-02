import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, password } = req.body;
    // Coalesce empty strings to null for unique constraints
    const email = req.body.email?.trim() || null;
    const phone = req.body.phone?.trim() || null;

    // Check if email or phone already exists
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email is already registered',
          },
        });
      }
    }

    if (phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PHONE_ALREADY_EXISTS',
            message: 'Phone number is already registered',
          },
        });
      }
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: email || phone || `user_${Date.now()}`,
          email,
          phone,
          password_hash: passwordHash,
          role: 'customer',
        },
      });

      const profile = await tx.customerProfile.create({
        data: {
          user_id: user.id,
          full_name: fullName,
        },
      });

      return { user, profile };
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    const refreshToken = generateRefreshToken({
      sub: result.user.id,
    });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
      data: {
        user_id: result.user.id,
        token: refreshToken,
        expires_at: expiresAt,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
          fullName: result.profile.full_name,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong during registration';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    // Find user by username, email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { phone: identifier },
        ],
      },
      include: {
        customer_profile: true,
        staff_profile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email/phone or password',
        },
      });
    }

    // Check if account is locked
    const now = new Date();
    if (user.locked_until && user.locked_until > now) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked due to too many failed attempts. Please try again later.',
        },
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Logic for lockout reset: if lock expired but attempt fails, reset counter to 1
      const isLockExpired = user.locked_until && user.locked_until <= now;
      const failedAttempts = isLockExpired ? 1 : user.failed_login_attempts + 1;
      let lockedUntil = isLockExpired ? null : user.locked_until;

      if (failedAttempts >= 5) {
        lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + 15); // 15-minute lockout
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: failedAttempts,
          locked_until: lockedUntil,
        },
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email/phone or password',
        },
      });
    }

    // Reset failed attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date(),
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      sub: user.id,
    });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
      },
    });

    // Determine fullName based on role
    const fullName = user.customer_profile?.full_name || user.staff_profile?.full_name || 'User';

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong during login';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken: providedToken } = req.body;

    if (!providedToken) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_REQUIRED', message: 'Refresh token is required' },
      });
    }

    // 1. JWT Signature Check (Review Finding [HIGH])
    let decoded: JwtPayload;
    try {
      decoded = verifyRefreshToken(providedToken);
    } catch (err) {
      return res.status(403).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid token signature' },
      });
    }

    // 2. Database Check
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: providedToken,
        expires_at: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken) {
      return res.status(403).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' },
      });
    }

    // 3. Refresh Token Rotation (Review Finding [LOW])
    // Generate new pair
    const accessToken = generateAccessToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    const newRefreshToken = generateRefreshToken({
      sub: storedToken.user.id,
    });

    // SEC-06: Create new token first, then delete old
    // This ensures there is always a valid token (no race condition gap)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({
      data: {
        user_id: storedToken.user.id,
        token: newRefreshToken,
        expires_at: expiresAt,
      },
    });

    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return res.status(200).json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Refresh token error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong during token refresh';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: unknown) {
    console.error('Logout error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong during logout';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as { sub: string | number }).sub;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        customer_profile: true,
        staff_profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    const fullName = (user as { customer_profile?: { full_name: string } | null; staff_profile?: { full_name: string } | null }).customer_profile?.full_name || (user as { staff_profile?: { full_name: string } | null }).staff_profile?.full_name || 'User';

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Get profile error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong while fetching profile';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    });
  }
};
