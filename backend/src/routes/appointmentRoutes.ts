import { Router } from 'express';
import { getAppointments, createAppointment } from '../controllers/appointmentController';
import { getAvailableSlots, getCommissionSummary, getStaffCommissions } from '../controllers/appointmentAvailability';
import { completeAppointment } from '../controllers/appointmentCompletion';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

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
router.post('/', authenticateToken, createAppointment);
router.post('/:id/complete', authenticateToken, authorizeRoles('staff', 'manager'), completeAppointment);

export default router;
