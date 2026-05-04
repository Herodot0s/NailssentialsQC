import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

interface PrismaError extends Error {
  code: string;
}

/**
 * Submit a review for a specific appointment item.
 */
export const submitReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.sub);
    const { appointmentItemId, rating, tags } = req.body;

    if (!appointmentItemId || !rating) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { user_id: userId },
    });

    if (!customerProfile) {
      return res.status(404).json({ success: false, message: 'Customer profile not found' });
    }

    // Ensure the appointment item belongs to this customer and is completed
    const item = await prisma.appointmentItem.findFirst({
      where: {
        id: parseInt(appointmentItemId),
        appointment: { customer_id: customerProfile.id },
        status: 'completed',
      },
    });

    if (!item) {
      return res.status(400).json({ success: false, message: 'Invalid appointment item or item not completed' });
    }

    const review = await prisma.review.create({
      data: {
        customer_id: customerProfile.id,
        staff_id: item.staff_id,
        appointment_item_id: item.id,
        rating: parseInt(rating),
        tags: tags || [],
        is_approved_for_public: false,
      },
    });

    return res.status(201).json({ success: true, data: review });
  } catch (error: unknown) {
    console.error('Submit review error:', error);
    if (error instanceof Error && 'code' in error && (error as PrismaError).code === 'P2002') {
       return res.status(400).json({ success: false, message: 'You have already reviewed this item' });
    }
    return res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};

/**
 * Get all reviews for a specific staff member.
 */
export const getStaffReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { staffId } = req.params;
    const reviews = await prisma.review.findMany({
      where: {
        staff_id: parseInt(staffId as string),
        is_approved_for_public: true,
      },
      include: {
        customer: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error: unknown) {
    console.error('Get staff reviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

/**
 * Manager: Get all reviews for moderation.
 */
export const getAllReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        customer: { select: { full_name: true } },
        staff: { select: { full_name: true } },
        appointment_item: { include: { service: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error: unknown) {
    console.error('Get all reviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

/**
 * Manager: Approve or reject a review for public display.
 */
export const moderateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await prisma.review.update({
      where: { id: parseInt(id as string) },
      data: { is_approved_for_public: isApproved },
    });

    return res.status(200).json({ success: true, data: review });
  } catch (error: unknown) {
    console.error('Moderate review error:', error);
    return res.status(500).json({ success: false, message: 'Failed to moderate review' });
  }
};

/**
 * Get approved reviews for the landing page carousel.
 */
export const getPublicReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { is_approved_for_public: true },
      include: {
        customer: { select: { full_name: true } },
        staff: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error: unknown) {
    console.error('Get public reviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch public reviews' });
  }
};
