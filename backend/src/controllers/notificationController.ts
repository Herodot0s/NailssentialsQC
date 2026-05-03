import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/apiHelpers';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return sendError(res, 'UNAUTHORIZED', 'Unauthorized', 401);

    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub;
    if (!userId) return sendError(res, 'UNAUTHORIZED', 'Unauthorized', 401);

    await prisma.notification.update({
      where: { id: parseInt(id as string), user_id: userId },
      data: { is_read: true },
    });

    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return sendError(res, 'UNAUTHORIZED', 'Unauthorized', 401);

    await prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};

export const createNotification = async (userId: number, type: string, title: string, message: string) => {
  try {
    return await prisma.notification.create({
      data: {
        user_id: userId,
        type,
        title,
        message,
      },
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};
