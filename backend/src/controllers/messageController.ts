import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Send a message to another user.
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.sub;
    const { receiverId, subject, body } = req.body;

    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!receiverId || !subject || !body) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const message = await prisma.message.create({
      data: {
        sender_id: senderId,
        receiver_id: parseInt(receiverId),
        subject,
        body,
      },
    });

    return res.status(201).json({ success: true, data: message });
  } catch (error: unknown) {
    console.error('Send message error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send message';
    return res.status(500).json({ success: false, message });
  }
};

/**
 * Get all messages for the logged-in user.
 */
export const getMyMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId },
        ],
      },
      include: {
        sender: { select: { id: true, username: true, role: true } },
        receiver: { select: { id: true, username: true, role: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({ success: true, data: messages });
  } catch (error: unknown) {
    console.error('Get my messages error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch messages';
    return res.status(500).json({ success: false, message });
  }
};

/**
 * Mark a message as read.
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { id } = req.params;

    const message = await prisma.message.update({
      where: {
        id: parseInt(id),
        receiver_id: userId, // Ensure only the receiver can mark as read
      },
      data: { is_read: true },
    });

    return res.status(200).json({ success: true, data: message });
  } catch (error: unknown) {
    console.error('Mark message as read error:', error);
    const message = error instanceof Error ? error.message : 'Failed to mark message as read';
    return res.status(500).json({ success: false, message });
  }
};
