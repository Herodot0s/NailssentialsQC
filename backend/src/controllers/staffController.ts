import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';

/**
 * Get all staff members
 */
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: 'staff',
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
        staff_profile: {
          select: {
            full_name: true,
            specializations: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json({
      success: true,
      data: staff.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone,
        isActive: u.is_active,
        fullName: u.staff_profile?.full_name,
        specializations: u.staff_profile?.specializations,
        createdAt: u.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Get all staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff list' });
  }
};

/**
 * Create a new staff member
 */
export const createStaff = async (req: Request, res: Response) => {
  const { fullName, email, phone, password, username, specializations } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: email || undefined },
          { phone: phone || undefined },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this username, email, or phone already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const newUser = await prisma.user.create({
      data: {
        username: username || email || fullName.toLowerCase().replace(/\s+/g, '.'),
        email,
        phone,
        password_hash: hashedPassword,
        role: 'staff',
        staff_profile: {
          create: {
            full_name: fullName,
            specializations,
          },
        },
      },
      include: {
        staff_profile: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        id: newUser.id,
        fullName: newUser.staff_profile?.full_name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to create staff member' });
  }
};

/**
 * Update staff member details
 */
export const updateStaff = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, email, phone, isActive, specializations } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id as string) },
      data: {
        email,
        phone,
        is_active: isActive,
        staff_profile: {
          update: {
            full_name: fullName,
            specializations,
          },
        },
      },
      include: {
        staff_profile: true,
      },
    });

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        id: updatedUser.id,
        fullName: updatedUser.staff_profile?.full_name,
        isActive: updatedUser.is_active,
      },
    });
  } catch (error: any) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to update staff member' });
  }
};
