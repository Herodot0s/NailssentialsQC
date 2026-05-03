import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';

/**
 * Get all staff members
 */
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    // Pagination params (D-10)
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const where: Prisma.UserWhereInput = {
      role: { in: ['staff', 'manager'] },
    };
    if (cursor) {
      where.id = { gt: cursor }; // D-09: id field cursor
    }

    const staff = await prisma.user.findMany({
      where,
      take: limit + 1, // D-12: cursor-only detection
      orderBy: { id: 'asc' },
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
    });

    const hasMore = staff.length > limit;
    const items = hasMore ? staff.slice(0, limit) : staff;
    const nextCursor = hasMore ? items[items.length - 1].id.toString() : null;

    // D-11: Response wrapper
    return res.json({
      success: true,
      data: {
        items: items.map((u) => ({
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
        nextCursor,
        hasMore,
      },
    });
  } catch (error: unknown) {
    console.error('Get all staff error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch staff list';
    res.status(500).json({ success: false, message });
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
  } catch (error: unknown) {
    console.error('Create staff error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create staff member';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Update staff member details
 */
export const updateStaff = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idStr = (Array.isArray(id) ? id[0] : id) as string;
  const idNum = parseInt(idStr);
  const { fullName, email, phone, isActive, specializations, basePayPerWeek, dailyTarget, sssNumber, tinNumber, govId, profilePictureUrl, role } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: idNum },
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
  } catch (error: unknown) {
    console.error('Update staff error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update staff member';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Get schedule for a specific staff member
 */
export const getStaffSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = (Array.isArray(id) ? id[0] : id) as string;
    const schedule = await prisma.staffSchedule.findMany({
      where: { staff_id: parseInt(idStr) },
    });
    res.json({ success: true, data: schedule });
  } catch (error: unknown) {
    console.error('Get schedule error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch schedule';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Update schedule for a specific staff member
 */
export const updateStaffSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const staffIdParam = req.validatedParams?.id ?? req.params.id;
    const staffId = typeof staffIdParam === 'number' ? staffIdParam : parseInt(String(staffIdParam), 10);
    const { schedules } = req.validatedBody ?? req.body;

    // Use a transaction to update all schedules for the staff
    type ScheduleItem = { day_of_week: number; start_time: string; end_time: string; is_active: boolean };
    await prisma.$transaction(
      (schedules as ScheduleItem[]).map((s: ScheduleItem) =>
        prisma.staffSchedule.upsert({
          // NOTE: staff_day_unique key requires prisma generate after migration
            // Temporary workaround pending prisma generate
            where: {
              staff_day_unique: {
                staff_id: staffId,
                day_of_week: s.day_of_week,
              }
            },
          update: {
            start_time: s.start_time,
            end_time: s.end_time,
            is_active: s.is_active,
          },
          create: {
            staff_id: staffId,
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            is_active: s.is_active,
          },
        })
      )
    );

    res.json({ success: true, message: 'Schedule updated successfully' });
  } catch (error: unknown) {
    console.error('Update schedule error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update schedule';
    res.status(500).json({ success: false, message });
  }
};
