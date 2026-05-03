import { Router } from 'express';
import { z } from 'zod';
import { getAppointments, createAppointment } from '../controllers/appointmentController';
import { getAvailableSlots, getCommissionSummary, getStaffCommissions } from '../controllers/appointmentAvailability';
import { completeAppointment } from '../controllers/appointmentCompletion';
import { authenticateToken, authorizeRoles, validateZod } from '../middleware/authMiddleware';
import { createAppointmentSchema, completeAppointmentSchema } from '../validators/appointmentSchemas';

// Validate :id parameter middleware
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

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

const router = Router();

router.get('/availability', getAvailableSlots);
router.get('/commission-summary', authenticateToken, authorizeRoles('staff', 'manager'), getCommissionSummary);
router.get('/staff-commissions', authenticateToken, authorizeRoles('staff', 'manager'), getStaffCommissions);
/**
 * GET /api/appointments
 * @query {string} [cursor] - Cursor ID for pagination (last ID from previous page, D-09)
 * @query {number} [limit=20] - Number of items per page (max 100, D-10)
 * @returns { success: boolean, data: { items: Appointment[], nextCursor: string | null, hasMore: boolean } } (D-11)
 */
router.get('/', authenticateToken, getAppointments);
router.post('/', authenticateToken, validateZod(createAppointmentSchema), createAppointment);
router.post('/:id/complete', authenticateToken, authorizeRoles('staff', 'manager'), validateIdParam, validateZod(completeAppointmentSchema), completeAppointment);

export default router;
