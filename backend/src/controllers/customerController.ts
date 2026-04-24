import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const profile = await prisma.customerProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const getCustomerHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // customer_id (not user_id)

    const history = await prisma.appointment.findMany({
      where: { customer_id: parseInt(id as string) },
      include: {
        services: { include: { service: true } },
        technician: true,
        transactions: true,
      },
      orderBy: { appointment_date: 'desc' },
    });

    const customer = await prisma.customerProfile.findUnique({
      where: { id: parseInt(id as string) },
      include: { user: { select: { email: true, phone: true } } }
    });

    return res.status(200).json({
      success: true,
      data: {
        customer,
        history,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customer history' });
  }
};

export const searchCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json({ success: true, data: [] });

    const customers = await prisma.customerProfile.findMany({
      where: {
        OR: [
          { full_name: { contains: query as string } },
          { user: { phone: { contains: query as string } } },
          { user: { email: { contains: query as string } } },
        ],
      },
      include: { user: { select: { email: true, phone: true } } },
      take: 10,
    });

    return res.status(200).json({ success: true, data: customers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to search customers' });
  }
};
