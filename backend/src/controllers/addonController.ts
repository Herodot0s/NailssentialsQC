import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/apiHelpers';

export const getAddons = async (req: Request, res: Response) => {
  try {
    const showAll = req.query.showAll === 'true';
    const where = showAll ? {} : { is_active: true };

    const addons = await prisma.addon.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, addons, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch addons';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};

export const createAddon = async (req: Request, res: Response) => {
  try {
    const { name, description, price, is_active } = req.body;
    const addon = await prisma.addon.create({
      data: {
        name,
        description,
        price,
        is_active: is_active ?? true,
      },
    });
    return sendSuccess(res, addon, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create addon';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};

export const updateAddon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, is_active } = req.body;
    const addon = await prisma.addon.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price,
        is_active,
      },
    });
    return sendSuccess(res, addon, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update addon';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};

export const deleteAddon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.addon.delete({
      where: { id: parseInt(id) },
    });
    return sendSuccess(res, { message: 'Deleted successfully' }, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete addon';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};
