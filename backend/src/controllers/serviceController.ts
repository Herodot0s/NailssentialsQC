import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { parentId, showAll } = req.query;

    const where: Prisma.ServiceCategoryWhereInput = {};
    if (showAll !== 'true') {
      where.is_active = true;
    }
    
    if (parentId !== undefined) {
      where.parent_id = parentId === 'null' ? null : parseInt(parentId as string);
    }

    const categories = await prisma.serviceCategory.findMany({
      where,
      include: {
        sub_categories: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: unknown) {
    console.error('Get categories error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong while fetching categories';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const { categoryId, showAll } = req.query;

    const where: Prisma.ServiceWhereInput = {};
    if (showAll !== 'true') {
      where.is_active = true;
      where.category = { is_active: true };
    }

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
        category: {
          include: { parent: true }
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error: unknown) {
    console.error('Get services error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong while fetching services';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, is_active, parentId } = req.body;
    const category = await prisma.serviceCategory.create({
      data: { 
        name, 
        description, 
        is_active: is_active !== undefined ? is_active : true,
        parent_id: parentId ? parseInt(parentId) : null 
      },
    });
    return res.status(201).json({ success: true, data: category });
  } catch (error: unknown) {
    console.error('Create category error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create category';
    return res.status(500).json({ success: false, message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.validatedParams ?? {};
    const { name, description, is_active, parentId } = req.body;
    const category = await prisma.serviceCategory.update({
      where: { id },
      data: { 
        name, 
        description, 
        is_active,
        parent_id: parentId !== undefined ? (parentId ? parseInt(parentId) : null) : undefined
      },
    });
    return res.status(200).json({ success: true, data: category });
  } catch (error: unknown) {
    console.error('Update category error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update category';
    return res.status(500).json({ success: false, message });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, duration_minutes, price, category_id, is_popular, image_url, experience_description, what_to_expect } = req.body;

    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration_minutes);

    if (isNaN(parsedPrice)) {
      return res.status(400).json({ success: false, message: 'Invalid price format' });
    }
    if (isNaN(parsedDuration)) {
      return res.status(400).json({ success: false, message: 'Invalid duration format' });
    }

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
        category: {
          connect: { id: parseInt(category_id) }
        },
        is_popular: is_popular || false,
        image_url,
        experience_description,
        what_to_expect,
      },
    });
    return res.status(201).json({ success: true, data: service });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create service';
    return res.status(500).json({ success: false, message });
  }
};

export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.validatedParams ?? {};
    const { name, description, duration_minutes, price, category_id, is_popular, is_active, image_url, experience_description, what_to_expect } = req.body;

    const parsedPrice = price !== undefined ? parseFloat(price) : undefined;
    const parsedDuration = duration_minutes !== undefined ? parseInt(duration_minutes) : undefined;

    if (parsedPrice !== undefined && isNaN(parsedPrice)) {
      return res.status(400).json({ success: false, message: 'Invalid price format' });
    }
    if (parsedDuration !== undefined && isNaN(parsedDuration)) {
      return res.status(400).json({ success: false, message: 'Invalid duration format' });
    }

    if (parsedPrice !== undefined && parsedPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative' });
    }
    if (parsedDuration !== undefined && parsedDuration <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be greater than 0' });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        duration_minutes: parsedDuration,
        price: parsedPrice,
        category: category_id ? {
          connect: { id: parseInt(category_id) }
        } : undefined,
        is_popular,
        is_active,
        image_url,
        experience_description,
        what_to_expect,
      },
    });
    return res.status(200).json({ success: true, data: service });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update service';
    return res.status(500).json({ success: false, message });
  }
};
