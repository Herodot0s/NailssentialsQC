import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { v2 as cloudinary } from 'cloudinary';

/**
 * GET /api/v1/exhibits
 * Returns all active exhibits with artist and service details
 */
export const getAllExhibits = async (req: AuthRequest, res: Response) => {
  try {
    const exhibits = await prisma.exhibit.findMany({
      where: { is_active: true },
      include: {
        artist: {
          select: {
            id: true,
            full_name: true,
            specializations: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.json({
      success: true,
      data: exhibits,
    });
  } catch (error) {
    console.error('Get exhibits error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibits',
    });
  }
};

/**
 * POST /api/v1/exhibits
 * Protected: Manager
 * Creates a new exhibit record
 */
export const createExhibit = async (req: AuthRequest, res: Response) => {
  try {
    const { title, image_url, staff_id, service_id } = req.body;

    if (!title || !image_url || !staff_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, image URL, and staff ID are required',
      });
    }

    const exhibit = await prisma.exhibit.create({
      data: {
        title,
        image_url,
        staff_id: Number(staff_id),
        service_id: service_id ? Number(service_id) : null,
      },
      include: {
        artist: {
          select: { full_name: true },
        },
        service: {
          select: { name: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: exhibit,
    });
  } catch (error) {
    console.error('Create exhibit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create exhibit',
    });
  }
};

/**
 * DELETE /api/v1/exhibits/:id
 * Protected: Manager
 * Deletes exhibit record and its associated blob
 */
export const deleteExhibit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const exhibit = await prisma.exhibit.findUnique({
      where: { id: Number(id) },
    });

    if (!exhibit) {
      return res.status(404).json({
        success: false,
        message: 'Exhibit not found',
      });
    }

    // Delete from Cloudinary if URL exists
    if (exhibit.image_url) {
      try {
        // Extract public ID from Cloudinary URL
        const urlParts = exhibit.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `nailssentials/${fileName.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudError) {
        console.error('Failed to delete Cloudinary image:', cloudError);
        // Continue with record deletion even if cloud deletion fails
      }
    }

    await prisma.exhibit.delete({
      where: { id: Number(id) },
    });

    return res.json({
      success: true,
      message: 'Exhibit deleted successfully',
    });
  } catch (error) {
    console.error('Delete exhibit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete exhibit',
    });
  }
};
