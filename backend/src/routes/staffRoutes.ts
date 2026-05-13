import { Router } from 'express';
import { z } from 'zod';
import {
  getAllStaff,
  createStaff,
  updateStaff,
  getStaffSchedule,
  updateStaffSchedule,
} from '../controllers/staffController';
import { authenticateToken, authorizeRoles, validateZod } from '../middleware/authMiddleware';
import { createStaffSchema, updateStaffSchema } from '../validators/staffSchemas';

// Zod schemas for validation
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const scheduleEntrySchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  is_active: z.boolean().optional(),
});

const updateScheduleSchema = z.object({
  schedules: z.array(scheduleEntrySchema),
});

// Validation middleware
const validateIdParam = (req: any, res: any, next: any) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' },
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
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid schedule data',
        details: result.error.flatten(),
      },
    });
  }
  req.validatedBody = result.data;
  next();
};

const router = Router();

// Staff list is viewable by all (for booking)
router.get('/', getAllStaff);

// All other staff routes are restricted to managers
router.use(authenticateToken);

// Management routes restricted to managers
router.use(authorizeRoles('manager'));
router.post('/', validateZod(createStaffSchema), createStaff);
router.put('/:id', validateIdParam, validateZod(updateStaffSchema), updateStaff);
router.get('/:id/schedule', getStaffSchedule);
router.put('/:id/schedule', validateIdParam, validateScheduleBody, updateStaffSchedule);

export default router;
