import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'TOKEN_REQUIRED', message: 'Invalid user token' } });
    }
    const profile = await prisma.customerProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    return res.status(500).json({ success: false, message });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'TOKEN_REQUIRED', message: 'Invalid user token' } });
    }
    const { fullName, preferences, allergies, notes } = req.body;

    const profile = await prisma.customerProfile.update({
      where: { user_id: userId },
      data: {
        full_name: fullName,
        preferences,
        allergies,
        notes,
      },
    });

    return res.status(200).json({ success: true, data: profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return res.status(500).json({ success: false, message });
  }
};

export const getCustomerHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // customer_id (not user_id)

    const idStr = (Array.isArray(id) ? id[0] : id) as string;
    const idNum = parseInt(idStr);
    const history = await prisma.appointment.findMany({
      where: { customer_id: idNum },
      include: {
        services: { include: { service: true } },
        technician: true,
        transactions: true,
      },
      orderBy: { appointment_date: 'desc' },
    });

    const customer = await prisma.customerProfile.findUnique({
      where: { id: idNum },
      include: { user: { select: { email: true, phone: true } } }
    });

    return res.status(200).json({
      success: true,
      data: {
        customer,
        history,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch customer history';
    return res.status(500).json({ success: false, message });
  }
};

export const searchCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json({ success: true, data: [] });

    const customers = await prisma.customerProfile.findMany({
      where: {
        OR: [
          { full_name: { contains: String(query) } },
          { user: { phone: { contains: String(query) } } },
          { user: { email: { contains: String(query) } } },
        ],
      },
      include: { user: { select: { email: true, phone: true } } },
      take: 10,
    });

    return res.status(200).json({ success: true, data: customers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to search customers';
    return res.status(500).json({ success: false, message });
  }
};
