import { Response } from 'express';
import { authorizeRoles } from '../middleware/authMiddleware';

/**
 * Check if the request is from a user with one of the allowed roles.
 * Wraps authorizeRoles from authMiddleware (D-01).
 */
export const authorize = (...roles: string[]) => {
  return authorizeRoles(...roles);
};

/**
 * Send a standardized success response (D-03 compatible).
 * @param res - Express response object
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 */
export const sendSuccess = (res: Response, data: any, status: number = 200) => {
  return res.status(status).json({ success: true, data });
};

/**
 * Send a standardized error response with optional fieldErrors (D-03).
 * @param res - Express response object
 * @param code - Error code (e.g., 'VALIDATION_ERROR')
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 400)
 * @param fieldErrors - Optional field-level errors for validation failures
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  status: number = 400,
  fieldErrors?: Record<string, string[]>
) => {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(fieldErrors && { fieldErrors }),
    },
  });
};

/**
 * Extract current user info from request (D-04).
 * Replaces repeated `req.user.sub` / `req.user.role` access.
 * @param req - Express request with user context from auth middleware
 * @returns User context or null if not authenticated
 */
export const getCurrentUser = (req: any): { userId: number; role: string; email?: string | null; fullName?: string } | null => {
  const { sub, role, email, fullName } = req.user || {};
  if (!sub) return null;
  return { userId: sub as number, role: role as string, email: email as string | undefined, fullName: fullName as string | undefined };
};
