import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'debug-package-controller.log');
const log = (msg: string) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

export const getAllPackages = async (req: AuthRequest, res: Response) => {
  try {
    const packages = await prisma.servicePackage.findMany({
      include: {
        items: {
          include: {
            service: {
              include: { category: { select: { name: true } } },
            },
          },
        },
        appointment_items: { select: { id: true } },
      },
      orderBy: { display_order: 'asc' },
    });

    log(`getAllPackages found ${packages.length} packages`);
    const data = packages.map((pkg) => ({
      ...pkg,
      services: pkg.items.map((item) => ({
        id: item.service.id,
        name: item.service.name,
        price: item.service.price.toString(),
        duration_minutes: item.service.duration_minutes,
        category: { name: item.service.category.name },
      })),
      bookings_count: pkg.appointment_items.length,
      services_total: pkg.items
        .reduce((sum, item) => sum + Number(item.service.price), 0)
        .toFixed(2),
    }));

    const cleanData = data.map(({ items, appointment_items, ...rest }) => rest);

    return res.json({ success: true, data: cleanData });
  } catch (error) {
    log(`getAllPackages error: ${error instanceof Error ? error.stack : error}`);
    console.error('getAllPackages error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getActivePackages = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const packages = await prisma.servicePackage.findMany({
      where: {
        is_active: true,
        OR: [{ valid_from: null }, { valid_from: { lte: now } }],
        AND: [
          {
            OR: [{ valid_until: null }, { valid_until: { gte: now } }],
          },
        ],
      },
      include: {
        items: {
          include: {
            service: {
              include: { category: { select: { name: true } } },
            },
          },
        },
        appointment_items: { select: { id: true } },
      },
      orderBy: { display_order: 'asc' },
    });

    const validPackages = packages.filter((pkg) => {
      if (pkg.max_redemptions !== null && pkg.appointment_items.length >= pkg.max_redemptions) {
        return false;
      }
      return true;
    });

    const data = validPackages.map((pkg) => ({
      ...pkg,
      services: pkg.items.map((item) => ({
        id: item.service.id,
        name: item.service.name,
        price: item.service.price.toString(),
        duration_minutes: item.service.duration_minutes,
        category: { name: item.service.category.name },
      })),
      bookings_count: 0,
      services_total: pkg.items
        .reduce((sum, item) => sum + Number(item.service.price), 0)
        .toFixed(2),
    }));

    const cleanData = data.map(({ items, appointment_items, ...rest }) => rest);

    return res.json({ success: true, data: cleanData });
  } catch (error) {
    console.error('getActivePackages error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPackage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const pkg = await prisma.servicePackage.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            service: {
              include: { category: { select: { name: true } } },
            },
          },
        },
        appointment_items: { select: { id: true } },
      },
    });

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const data = {
      ...pkg,
      services: pkg.items.map((item) => ({
        id: item.service.id,
        name: item.service.name,
        price: item.service.price.toString(),
        duration_minutes: item.service.duration_minutes,
        category: { name: item.service.category.name },
      })),
      bookings_count: pkg.appointment_items.length,
      services_total: pkg.items
        .reduce((sum, item) => sum + Number(item.service.price), 0)
        .toFixed(2),
    };

    const { items, appointment_items, ...cleanData } = data;

    return res.json({ success: true, data: cleanData });
  } catch (error) {
    console.error('getPackage error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createPackage = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      image_url,
      display_order,
      valid_from,
      valid_until,
      max_redemptions,
      is_active,
      service_ids,
    } = req.body;

    if (!service_ids || service_ids.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: 'A package must contain at least 2 services' });
    }

    if (price <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Package price must be greater than zero' });
    }

    const existingServices = await prisma.service.findMany({
      where: { id: { in: service_ids }, is_active: true },
    });

    if (existingServices.length !== service_ids.length) {
      return res
        .status(400)
        .json({ success: false, message: 'One or more services are invalid or inactive' });
    }

    const newPackage = await prisma.servicePackage.create({
      data: {
        name,
        description,
        price,
        image_url,
        display_order: display_order || 0,
        valid_from: valid_from ? new Date(valid_from) : null,
        valid_until: valid_until ? new Date(valid_until) : null,
        max_redemptions,
        is_active: is_active !== undefined ? is_active : true,
        items: {
          create: service_ids.map((id: number) => ({ service_id: id })),
        },
      },
      include: {
        items: {
          include: {
            service: {
              include: { category: { select: { name: true } } },
            },
          },
        },
        appointment_items: { select: { id: true } },
      },
    });

    const data = {
      ...newPackage,
      services: newPackage.items.map((item) => ({
        id: item.service.id,
        name: item.service.name,
        price: item.service.price.toString(),
        duration_minutes: item.service.duration_minutes,
        category: { name: item.service.category.name },
      })),
      bookings_count: newPackage.appointment_items.length,
      services_total: newPackage.items
        .reduce((sum, item) => sum + Number(item.service.price), 0)
        .toFixed(2),
    };

    const { items, appointment_items, ...cleanData } = data;

    return res.status(201).json({ success: true, data: cleanData });
  } catch (error) {
    console.error('createPackage error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatePackage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      image_url,
      display_order,
      valid_from,
      valid_until,
      max_redemptions,
      is_active,
      service_ids,
    } = req.body;

    if (service_ids && service_ids.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: 'A package must contain at least 2 services' });
    }

    if (price !== undefined && price <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Package price must be greater than zero' });
    }

    if (service_ids) {
      const existingServices = await prisma.service.findMany({
        where: { id: { in: service_ids }, is_active: true },
      });

      if (existingServices.length !== service_ids.length) {
        return res
          .status(400)
          .json({ success: false, message: 'One or more services are invalid or inactive' });
      }
    }

    let updatedPackage;
    if (service_ids) {
      const [, pkg] = await prisma.$transaction([
        prisma.servicePackageItem.deleteMany({ where: { package_id: Number(id) } }),
        prisma.servicePackage.update({
          where: { id: Number(id) },
          data: {
            name,
            description,
            price,
            image_url,
            display_order,
            valid_from: valid_from ? new Date(valid_from) : valid_from === null ? null : undefined,
            valid_until: valid_until
              ? new Date(valid_until)
              : valid_until === null
                ? null
                : undefined,
            max_redemptions,
            is_active,
            items: { create: service_ids.map((sid: number) => ({ service_id: sid })) },
          },
          include: {
            items: { include: { service: { include: { category: { select: { name: true } } } } } },
            appointment_items: { select: { id: true } },
          },
        }),
      ]);
      updatedPackage = pkg;
    } else {
      updatedPackage = await prisma.servicePackage.update({
        where: { id: Number(id) },
        data: {
          name,
          description,
          price,
          image_url,
          display_order,
          valid_from: valid_from ? new Date(valid_from) : valid_from === null ? null : undefined,
          valid_until: valid_until
            ? new Date(valid_until)
            : valid_until === null
              ? null
              : undefined,
          max_redemptions,
          is_active,
        },
        include: {
          items: { include: { service: { include: { category: { select: { name: true } } } } } },
          appointment_items: { select: { id: true } },
        },
      });
    }

    const data = {
      ...updatedPackage,
      services: updatedPackage.items.map((item) => ({
        id: item.service.id,
        name: item.service.name,
        price: item.service.price.toString(),
        duration_minutes: item.service.duration_minutes,
        category: { name: item.service.category.name },
      })),
      bookings_count: updatedPackage.appointment_items.length,
      services_total: updatedPackage.items
        .reduce((sum, item) => sum + Number(item.service.price), 0)
        .toFixed(2),
    };

    const { items, appointment_items, ...cleanData } = data;

    return res.json({ success: true, data: cleanData });
  } catch (error) {
    console.error('updatePackage error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const togglePackage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const pkg = await prisma.servicePackage.update({
      where: { id: Number(id) },
      data: { is_active },
      include: {
        items: { include: { service: { include: { category: { select: { name: true } } } } } },
        appointment_items: { select: { id: true } },
      },
    });

    const data = {
      ...pkg,
      services: pkg.items.map((item) => ({
        id: item.service.id,
        name: item.service.name,
        price: item.service.price.toString(),
        duration_minutes: item.service.duration_minutes,
        category: { name: item.service.category.name },
      })),
      bookings_count: pkg.appointment_items.length,
      services_total: pkg.items
        .reduce((sum, item) => sum + Number(item.service.price), 0)
        .toFixed(2),
    };
    const { items, appointment_items, ...cleanData } = data;

    return res.json({ success: true, data: cleanData });
  } catch (error) {
    console.error('togglePackage error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deletePackage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bookingCount = await prisma.appointmentItem.count({ where: { package_id: Number(id) } });
    if (bookingCount > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Cannot delete a package with existing bookings. Deactivate it instead.',
        });
    }

    await prisma.servicePackage.delete({ where: { id: Number(id) } });

    return res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    console.error('deletePackage error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
