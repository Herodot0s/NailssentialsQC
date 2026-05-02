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
        role: { in: ['staff', 'manager'] },
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
        sss_number: true,
        tin_number: true,
        gov_id: true,
        profile_picture_url: true,
        staff_profile: {
          select: {
            id: true,
            full_name: true,
            specializations: true,
            base_pay_per_week: true,
            daily_target: true,
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
        role: u.role,
        isActive: u.is_active,
        fullName: u.staff_profile?.full_name,
        staffProfileId: u.staff_profile?.id,
        specializations: u.staff_profile?.specializations,
        basePayPerWeek: u.staff_profile?.base_pay_per_week,
        dailyTarget: u.staff_profile?.daily_target,
        sssNumber: u.sss_number,
        tinNumber: u.tin_number,
        govId: u.gov_id,
        profilePictureUrl: u.profile_picture_url,
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
  const { fullName, email, phone, password, username, specializations, basePayPerWeek, dailyTarget, sssNumber, tinNumber, govId, profilePictureUrl, role } = req.body;

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
        role: role || 'staff',
        sss_number: sssNumber,
        tin_number: tinNumber,
        gov_id: govId,
        profile_picture_url: profilePictureUrl,
        staff_profile: {
          create: {
            full_name: fullName,
            specializations,
            base_pay_per_week: basePayPerWeek ? parseFloat(basePayPerWeek) : 2500.00,
            daily_target: dailyTarget ? parseFloat(dailyTarget) : 6000.00,
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
  const { fullName, email, phone, isActive, specializations, basePayPerWeek, dailyTarget, sssNumber, tinNumber, govId, profilePictureUrl, role } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id as string) },
      data: {
        email,
        phone,
        is_active: isActive,
        role,
        sss_number: sssNumber,
        tin_number: tinNumber,
        gov_id: govId,
        profile_picture_url: profilePictureUrl,
        staff_profile: {
          update: {
            full_name: fullName,
            specializations,
            base_pay_per_week: basePayPerWeek ? parseFloat(basePayPerWeek) : undefined,
            daily_target: dailyTarget ? parseFloat(dailyTarget) : undefined,
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

/**
 * Get schedule for a specific staff member
 */
export const getStaffSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schedule = await prisma.staffSchedule.findMany({
      where: { staff_id: parseInt(id as string) },
    });
    res.json({ success: true, data: schedule });
  } catch (error: any) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule' });
  }
};

/**
 * Update schedule for a specific staff member
 */
export const updateStaffSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.validatedParams || req.params;
    const { schedules } = req.validatedBody || req.body;

    // Use a transaction to update all schedules for the staff
    await prisma.$transaction(
      schedules.map((s: any) =>
        prisma.staffSchedule.upsert({
          where: {
            staff_day_unique: {
              staff_id: typeof id === 'number' ? id : parseInt(id as string),
              day_of_week: s.day_of_week,
            }
          },
          update: {
            start_time: s.start_time,
            end_time: s.end_time,
            is_active: s.is_active,
          },
          create: {
            staff_id: typeof id === 'number' ? id : parseInt(id as string),
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            is_active: s.is_active,
          },
        })
      )
    );

    res.json({ success: true, message: 'Schedule updated successfully' });
  } catch (error: any) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
};
