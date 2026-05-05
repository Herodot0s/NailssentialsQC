import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET /api/v1/cms/settings
 * Public — returns all SiteSettings grouped by section as a nested object
 */
export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findMany();

    // Group by section for easy frontend consumption
    const grouped: Record<string, Record<string, string>> = {};
    for (const s of settings) {
      if (!grouped[s.section]) grouped[s.section] = {};
      grouped[s.section][s.key] = s.value;
    }

    return res.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

/**
 * PUT /api/v1/cms/settings
 * Protected: Manager — upserts multiple settings in a single transaction
 * Body: { settings: Array<{ section: string; key: string; value: string }> }
 */
export const saveSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({ success: false, message: 'settings must be a non-empty array' });
    }

    if (settings.length > 50) {
      return res.status(400).json({ success: false, message: 'Too many settings in one request (max 50)' });
    }

    // Validate each item
    for (const s of settings) {
      if (!s.section || !s.key || s.value === undefined) {
        return res.status(400).json({ success: false, message: 'Each setting must have section, key, and value' });
      }
    }

    // Upsert all settings in a transaction
    const ops = settings.map((s: { section: string; key: string; value: string }) =>
      prisma.siteSettings.upsert({
        where: { section_key_unique: { section: s.section, key: s.key } },
        update: { value: s.value },
        create: { section: s.section, key: s.key, value: s.value },
      })
    );

    await prisma.$transaction(ops);

    return res.json({ success: true, data: { updated: settings.length } });
  } catch (error) {
    console.error('Save settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
};

/**
 * GET /api/v1/cms/content
 * Public — returns SiteContent records filtered by type and limit
 * Query: ?type=faq|policy&limit=5&activeOnly=true
 */
export const getContent = async (req: AuthRequest, res: Response) => {
  try {
    const { type, limit, activeOnly } = req.query;

    const where: any = {};
    if (type === 'faq' || type === 'policy') {
      where.type = type;
    }
    if (activeOnly !== 'false') {
      where.is_active = true; // Default: only return active items for public consumption
    }

    const take = limit ? Math.min(Number(limit), 100) : undefined;

    const content = await prisma.siteContent.findMany({
      where,
      orderBy: { sort_order: 'asc' },
      take,
    });

    return res.json({ success: true, data: content });
  } catch (error) {
    console.error('Get content error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
};

/**
 * POST /api/v1/cms/content
 * Protected: Manager — creates a new FAQ or policy record
 * Body: { type: 'faq'|'policy', title, body, sort_order?, is_active? }
 */
export const createContent = async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, body, sort_order, is_active } = req.body;

    if (!type || !title || !body) {
      return res.status(400).json({ success: false, message: 'type, title, and body are required' });
    }

    if (type !== 'faq' && type !== 'policy') {
      return res.status(400).json({ success: false, message: 'type must be "faq" or "policy"' });
    }

    const content = await prisma.siteContent.create({
      data: {
        type,
        title,
        body,
        sort_order: sort_order !== undefined ? Number(sort_order) : 0,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      },
    });

    return res.status(201).json({ success: true, data: content });
  } catch (error) {
    console.error('Create content error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create content' });
  }
};

/**
 * PUT /api/v1/cms/content/:id
 * Protected: Manager — updates an existing FAQ or policy record
 * Body: { title?, body?, sort_order?, is_active? }
 */
export const updateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, body, sort_order, is_active } = req.body;

    const existing = await prisma.siteContent.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    const content = await prisma.siteContent.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
        ...(sort_order !== undefined && { sort_order: Number(sort_order) }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });

    return res.json({ success: true, data: content });
  } catch (error) {
    console.error('Update content error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update content' });
  }
};

/**
 * DELETE /api/v1/cms/content/:id
 * Protected: Manager — deletes a FAQ or policy record
 */
export const deleteContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.siteContent.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    await prisma.siteContent.delete({ where: { id: Number(id) } });

    return res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
};
