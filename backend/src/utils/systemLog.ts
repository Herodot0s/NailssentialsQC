import { AuthRequest } from '../middleware/authMiddleware';
import prisma from './prisma';

/**
 * Log a system action for audit purposes.
 * Resilient to logging failures to prevent blocking main transactions.
 *
 * @param req - The request object containing user context and metadata
 * @param action - The action string (e.g., 'STAFF_CREATED', 'PAYROLL_LOCKED')
 * @param entityType - The type of entity being acted upon (optional)
 * @param entityId - The ID of the entity being acted upon (optional)
 * @param details - Additional structured data about the action (optional)
 */
export const logSystemAction = async (
  req: AuthRequest,
  action: string,
  entityType?: string,
  entityId?: number,
  details?: Record<string, any>,
) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : null;
    const ipAddress = (req.ip || req.socket.remoteAddress) as string | null;
    const userAgent = req.headers['user-agent'] as string | null;

    await prisma.systemLog.create({
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {},
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });
  } catch (error) {
    // Log failure but do not rethrow - auditing should not crash the business logic
    console.error(`[systemLog] Failed to record audit log for action: ${action}`, error);
  }
};
