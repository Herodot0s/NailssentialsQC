import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getAuth, clerkClient } from '@clerk/express';
import prisma from '../utils/prisma';

export interface AppUserPayload {
  sub: string | number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface AuthRequest extends Request {
  user?: AppUserPayload;
  validatedParams?: Record<string, any>;
  validatedBody?: Record<string, any>;
  auth?: any; // Clerk auth object
}

// Simple in-memory cache for verification status to avoid hitting Clerk API on every request
const verificationCache = new Map<string, { isVerified: boolean; lastChecked: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  
  if (!auth.userId) {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_REQUIRED', message: 'Authentication required' },
    });
  }

  try {
    // 1. Try to find user by clerk_id
    let user = await prisma.user.findUnique({
      where: { clerk_id: auth.userId },
      include: { customer_profile: true, staff_profile: true },
    });

    // 2. If not found by clerk_id, check if user exists with the same email (Link Account)
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress 
                 || clerkUser.emailAddresses[0]?.emailAddress 
                 || null;
      
      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
      const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId);
      const isVerified = primaryEmail?.verification?.status === 'verified';
      
      // Extract role from Clerk publicMetadata (default to customer)
      const clerkRole = (clerkUser.publicMetadata?.role as string) || 'customer';
      const role = ['manager', 'staff', 'customer'].includes(clerkRole) ? clerkRole : 'customer';

      if (email) {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email },
              { username: email }
            ]
          },
          include: { customer_profile: true, staff_profile: true },
        });

        if (user) {
          // Link existing account to Clerk and sync profile/role
          user = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
              where: { id: user!.id },
              data: { 
                clerk_id: auth.userId,
                role: role as any
              },
            });

            if (updatedUser.role === 'customer') {
              await tx.customerProfile.upsert({
                where: { user_id: updatedUser.id },
                update: { full_name: fullName },
                create: { user_id: updatedUser.id, full_name: fullName },
              });
            } else {
              await tx.staffProfile.upsert({
                where: { user_id: updatedUser.id },
                update: { full_name: fullName },
                create: { user_id: updatedUser.id, full_name: fullName },
              });
            }

            return tx.user.findUnique({
              where: { id: updatedUser.id },
              include: { customer_profile: true, staff_profile: true },
            });
          }) as any;
        }
      }

      // 3. Still no user? Create new one
      if (!user) {
        user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              clerk_id: auth.userId,
              username: email || `user_${Date.now()}`,
              email,
              role: role as any,
              is_active: isVerified,
            },
          });

          if (role === 'customer') {
            await tx.customerProfile.create({
              data: {
                user_id: newUser.id,
                full_name: fullName,
              },
            });
          } else {
            // manager or staff gets a staff profile
            await tx.staffProfile.create({
              data: {
                user_id: newUser.id,
                full_name: fullName,
              },
            });
          }

          return tx.user.findUnique({
            where: { id: newUser.id },
            include: { customer_profile: true, staff_profile: true },
          }) as any;
        });

        // Initialize cache
        verificationCache.set(auth.userId, { isVerified, lastChecked: Date.now() });
      }
    }

    // 4. Periodic re-sync of verification status (Performance Optimized)
    const cached = verificationCache.get(auth.userId);
    const now = Date.now();

    if (!cached || (now - cached.lastChecked) > CACHE_TTL) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      );
      const isVerified = primaryEmail?.verification?.status === 'verified';

      if (user!.is_active !== isVerified) {
        user = await prisma.user.update({
          where: { id: user!.id },
          data: { is_active: isVerified },
          include: { customer_profile: true, staff_profile: true },
        });
      }
      
      verificationCache.set(auth.userId, { isVerified, lastChecked: now });
    }

    if (!user) {
      throw new Error('Failed to sync user');
    }

    req.user = {
      sub: user.id,
      email: user.email || '',
      role: user.role,
      type: 'access',
    };
    req.auth = auth;
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session' },
    });
  }
};



export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to perform this action',
        },
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
