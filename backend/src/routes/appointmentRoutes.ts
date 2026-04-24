import { Router } from 'express';
import { createAppointment, getAvailableSlots, getAppointments, completeAppointment, getCommissionSummary, getStaffCommissions } from '../controllers/appointmentController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/availability', getAvailableSlots);
router.get('/commission-summary', authenticateToken, authorizeRoles('staff', 'manager'), getCommissionSummary);
router.get('/staff-commissions', authenticateToken, authorizeRoles('staff', 'manager'), getStaffCommissions);
router.get('/', authenticateToken, getAppointments);
router.post('/', authenticateToken, createAppointment);
router.post('/:id/complete', authenticateToken, authorizeRoles('staff', 'manager'), completeAppointment);

export default router;
