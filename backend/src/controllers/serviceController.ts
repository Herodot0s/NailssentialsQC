import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong while fetching categories',
      },
    });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;

    const where: any = { is_active: true };
    if (categoryId) {
      const parsedId = parseInt(categoryId as string);
      if (isNaN(parsedId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: 'categoryId must be a number',
          },
        });
      }
      where.category_id = parsedId;
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    console.error('Get services error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong while fetching services',
      },
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.serviceCategory.create({
      data: { name, description },
    });
    return res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    const category = await prisma.serviceCategory.update({
      where: { id: parseInt(id as string) },
      data: { name, description, is_active },
    });
    return res.status(200).json({ success: true, data: category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, duration_minutes, price, category_id, is_popular } = req.body;

    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration_minutes);

    if (parsedPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative' });
    }
    if (parsedDuration <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be greater than 0' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration_minutes: parsedDuration,
        price: parsedPrice,
        category_id: parseInt(category_id),
        is_popular: is_popular || false,
      },
    });
    return res.status(201).json({ success: true, data: service });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create service' });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, duration_minutes, price, category_id, is_popular, is_active } = req.body;

    const parsedPrice = price !== undefined ? parseFloat(price) : undefined;
    const parsedDuration = duration_minutes !== undefined ? parseInt(duration_minutes) : undefined;

    if (parsedPrice !== undefined && parsedPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative' });
    }
    if (parsedDuration !== undefined && parsedDuration <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be greater than 0' });
    }

    const service = await prisma.service.update({
      where: { id: parseInt(id as string) },
      data: {
        name,
        description,
        duration_minutes: parsedDuration,
        price: parsedPrice,
        category_id: category_id ? parseInt(category_id) : undefined,
        is_popular,
        is_active,
      },
    });
    return res.status(200).json({ success: true, data: service });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update service' });
  }
};
