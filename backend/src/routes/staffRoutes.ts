import { Router } from 'express';
import { z } from 'zod';
import { getAllStaff, createStaff, updateStaff, getStaffSchedule, updateStaffSchedule } from '../controllers/staffController';
import { authenticateToken, authorizeRoles, validateZod } from '../middleware/authMiddleware';
import { createStaffSchema, updateStaffSchema } from '../validators/staffSchemas';

// Zod schemas for validation
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

const scheduleEntrySchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  is_active: z.boolean().optional()
});

const updateScheduleSchema = z.object({
  schedules: z.array(scheduleEntrySchema)
});

// Validation middleware
const validateIdParam = (req: any, res: any, next: any) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' }
    });
  }
  req.validatedParams = result.data;
  next();
};

const validateScheduleBody = (req: any, res: any, next: any) => {
  const result = updateScheduleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid schedule data', details: result.error.flatten() }
    });
  }
  req.validatedBody = result.data;
  next();
};

const router = Router();

// All staff routes are restricted to managers
router.use(authenticateToken);
router.use(authorizeRoles('manager'));

/**
 * GET /api/staff
 * @query {string} [cursor] - Cursor ID for pagination (last ID from previous page, D-09)
 * @query {number} [limit=20] - Number of items per page (max 100, D-10)
 * @returns { success: boolean, data: { items: Staff[], nextCursor: string | null, hasMore: boolean } } (D-11)
 */
router.get('/', getAllStaff);
router.post('/', validateZod(createStaffSchema), createStaff);
router.put('/:id', validateIdParam, validateZod(updateStaffSchema), updateStaff);
router.get('/:id/schedule', getStaffSchedule);
router.put('/:id/schedule', validateIdParam, validateScheduleBody, updateStaffSchedule);

export default router;
