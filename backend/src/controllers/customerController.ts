import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { clerkClient } from '@clerk/express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/apiHelpers';
import { logSystemAction } from '../utils/systemLog';

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: { code: 'TOKEN_REQUIRED', message: 'Invalid user token' } });
    }
    const profile = await prisma.customerProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    return res.status(500).json({ success: false, message });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub as number | undefined;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: { code: 'TOKEN_REQUIRED', message: 'Invalid user token' } });
    }
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return res.status(500).json({ success: false, message });
  }
};

export const getCustomerHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // customer_id (not user_id)

    const idStr = (Array.isArray(id) ? id[0] : id) as string;
    const idNum = parseInt(idStr);
    const history = await prisma.appointment.findMany({
      where: { customer_id: idNum },
      include: {
        services: { include: { service: true } },
        technician: true,
        transactions: true,
      },
      orderBy: { appointment_date: 'desc' },
    });

    const customer = await prisma.customerProfile.findUnique({
      where: { id: idNum },
      include: { user: { select: { email: true, phone: true } } },
    });

    return res.status(200).json({
      success: true,
      data: {
        customer,
        history,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch customer history';
    return res.status(500).json({ success: false, message });
  }
};

export const searchCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json({ success: true, data: [] });

    const customers = await prisma.customerProfile.findMany({
      where: {
        OR: [
          { full_name: { contains: String(query), mode: 'insensitive' } },
          { user: { phone: { contains: String(query), mode: 'insensitive' } } },
          { user: { email: { contains: String(query), mode: 'insensitive' } } },
        ],
      },
      include: { user: { select: { email: true, phone: true, is_active: true } } },
      take: 10,
    });

    return res.status(200).json({ success: true, data: customers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to search customers';
    return res.status(500).json({ success: false, message });
  }
};

/**
 * Get all customers with pagination and search filtering
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search ? String(req.query.search).trim() : '';

    const where: Prisma.UserWhereInput = {
      role: 'customer',
    };

    if (cursor) {
      where.id = { gt: cursor };
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { customer_profile: { full_name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      take: limit + 1,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
        customer_profile: {
          select: {
            id: true,
            full_name: true,
            preferences: true,
            allergies: true,
            notes: true,
          },
        },
      },
    });

    const hasMore = customers.length > limit;
    const items = hasMore ? customers.slice(0, limit) : customers;
    const nextCursor = hasMore ? items[items.length - 1].id.toString() : null;

    return sendSuccess(res, {
      items: items.map((u) => ({
        id: u.id,
        username: u.username,
        role: u.role,
        fullName: u.customer_profile?.full_name || 'Anonymous Customer',
        customerProfileId: u.customer_profile?.id,
        email: u.email,
        phone: u.phone,
        isActive: u.is_active,
        preferences: u.customer_profile?.preferences,
        allergies: u.customer_profile?.allergies,
        notes: u.customer_profile?.notes,
        createdAt: u.created_at,
      })),
      nextCursor,
      hasMore,
    });
  } catch (error: unknown) {
    console.error('Get all customers error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch customer list';
    return sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
};

/**
 * Create a new customer profile
 */
export const createCustomer = async (req: Request, res: Response) => {
  const body = (req as AuthRequest).validatedBody || req.body;
  const {
    fullName,
    email,
    phone,
    password,
    username,
    preferences,
    allergies,
    notes,
    isActive,
    is_active,
  } = body;

  const finalIsActive =
    isActive !== undefined ? isActive : is_active !== undefined ? is_active : true;
  const finalUsername = username || email || fullName.toLowerCase().replace(/\s+/g, '.');

  try {
    // Check if user already exists in local DB
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: finalUsername },
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return sendError(
        res,
        'USER_ALREADY_EXISTS',
        'A user with this username, email, or phone already exists.',
        400,
      );
    }

    // Clerk Synchronization
    let clerkId = null;

    if (email) {
      try {
        const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [email] });
        const clerkUser = clerkUsers.data[0];

        if (clerkUser) {
          clerkId = clerkUser.id;
          await clerkClient.users.updateUserMetadata(clerkId, {
            publicMetadata: { role: 'customer' },
          });
        } else {
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || 'Customer';
          const lastName = nameParts.slice(1).join(' ') || ' ';

          const newClerkUser = await clerkClient.users.createUser({
            emailAddress: [email],
            firstName,
            lastName,
            publicMetadata: { role: 'customer' },
          });
          clerkId = newClerkUser.id;
        }
      } catch (clerkError: unknown) {
        const errMessage = clerkError instanceof Error ? clerkError.message : String(clerkError);
        console.error('Clerk sync error during customer creation:', clerkError);
        // We log but don't strictly block customer creation if Clerk fails (e.g. in offline testing)
        // unless they must have it. In our case, staff creation blocks, so we block too.
        return sendError(res, 'CLERK_SYNC_ERROR', `Failed to sync with Clerk: ${errMessage}`, 500);
      }
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const passwordHash = password ? await bcrypt.hash(password, saltRounds) : null;

    const newUser = await prisma.user.create({
      data: {
        clerk_id: clerkId,
        username: finalUsername,
        email,
        phone,
        password_hash: passwordHash,
        role: 'customer',
        is_active: finalIsActive,
        customer_profile: {
          create: {
            full_name: fullName,
            preferences: preferences || {},
            allergies,
            notes,
          },
        },
      },
      include: {
        customer_profile: true,
      },
    });

    await logSystemAction(req as AuthRequest, 'CUSTOMER_CREATED', 'Customer', newUser.id, {
      message: 'Created customer profile',
    });

    return sendSuccess(
      res,
      {
        id: newUser.id,
        allergies: newUser.customer_profile?.allergies,
        notes: newUser.customer_profile?.notes,
        preferences: newUser.customer_profile?.preferences,
        isActive: newUser.is_active,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          isActive: newUser.is_active,
          fullName: newUser.customer_profile?.full_name,
        },
      },
      201,
    );
  } catch (error: unknown) {
    console.error('Create customer error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create customer';
    return res.status(500).json({ success: false, message });
  }
};

/**
 * Update a customer profile
 */
export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idStr = (Array.isArray(id) ? id[0] : id) as string;
  const idNum = parseInt(idStr);

  const body = (req as AuthRequest).validatedBody || req.body;
  const {
    fullName,
    email,
    phone,
    password,
    username,
    preferences,
    allergies,
    notes,
    isActive,
    is_active,
  } = body;

  const finalIsActive =
    isActive !== undefined ? isActive : is_active !== undefined ? is_active : undefined;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: idNum },
      include: { customer_profile: true },
    });

    if (!existingUser) {
      return sendError(res, 'USER_NOT_FOUND', 'Customer profile not found.', 404);
    }

    // Sync Clerk role/metadata if needed
    if (existingUser.clerk_id) {
      try {
        await clerkClient.users.updateUserMetadata(existingUser.clerk_id, {
          publicMetadata: { role: 'customer' },
        });
      } catch (clerkError: unknown) {
        console.error('Clerk sync error during customer update:', clerkError);
      }
    }

    const data: Prisma.UserUpdateInput = {
      email,
      phone,
      username,
      is_active: finalIsActive === undefined ? undefined : Boolean(finalIsActive),
      customer_profile: {
        upsert: {
          update: {
            full_name: fullName,
            preferences: preferences !== undefined ? preferences || {} : undefined,
            allergies,
            notes,
          },
          create: {
            full_name: fullName || 'New Customer',
            preferences: preferences || {},
            allergies,
            notes,
          },
        },
      },
    };

    if (password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
      data.password_hash = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await prisma.user.update({
      where: { id: idNum },
      data,
      include: {
        customer_profile: true,
      },
    });

    await logSystemAction(req as AuthRequest, 'CUSTOMER_UPDATED', 'Customer', idNum, {
      message: 'Updated customer profile',
    });

    return sendSuccess(res, {
      id: updatedUser.id,
      fullName: updatedUser.customer_profile?.full_name,
      allergies: updatedUser.customer_profile?.allergies,
      notes: updatedUser.customer_profile?.notes,
      preferences: updatedUser.customer_profile?.preferences,
      isActive: updatedUser.is_active,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.is_active,
        fullName: updatedUser.customer_profile?.full_name,
      },
    });
  } catch (error: unknown) {
    console.error('Update customer error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update customer';
    return res.status(500).json({ success: false, message });
  }
};

/**
 * Delete a customer profile
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idStr = (Array.isArray(id) ? id[0] : id) as string;
  const idNum = parseInt(idStr);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: idNum },
      include: { customer_profile: true },
    });

    if (!existingUser) {
      return sendError(res, 'USER_NOT_FOUND', 'Customer profile not found.', 404);
    }

    // Optionally delete from Clerk as well
    if (existingUser.clerk_id) {
      try {
        await clerkClient.users.deleteUser(existingUser.clerk_id);
      } catch (clerkError: unknown) {
        console.error('Failed to delete user from Clerk:', clerkError);
        // Continue to delete locally even if Clerk delete fails (e.g. user already deleted)
      }
    }

    await prisma.user.delete({
      where: { id: idNum },
    });

    await logSystemAction(req as AuthRequest, 'CUSTOMER_DELETED', 'Customer', idNum, {
      message: 'Deleted customer profile and user account',
    });

    return sendSuccess(res, {
      message: 'Customer profile deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete customer error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete customer';
    return res.status(500).json({ success: false, message });
  }
};
