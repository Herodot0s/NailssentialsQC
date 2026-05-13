import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError, getCurrentUser } from '../utils/apiHelpers';

/**
 * Get current authenticated user profile (Synced with Clerk)
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return sendError(res, 'UNAUTHORIZED', 'User not authenticated', 401);
    }
    
    const userId = currentUser.userId;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        customer_profile: true,
        staff_profile: true,
      },
    });

    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found in local database', 404);
    }

    const fullName = user.customer_profile?.full_name || user.staff_profile?.full_name || 'User';
    const staffProfileId = user.staff_profile?.id;

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName,
          staffProfileId,
          isActive: user.is_active,
        },
      },
      200,
    );
  } catch (error: unknown) {
    console.error('Get profile error:', error);
    const message =
      error instanceof Error ? error.message : 'Something went wrong while fetching profile';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};
