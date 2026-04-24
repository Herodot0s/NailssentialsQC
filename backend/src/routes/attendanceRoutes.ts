import { Router } from 'express';
import {
  getAttendanceStatus,
  checkIn,
  checkOut,
  getAllAttendance,
  updateAttendance,
} from '../controllers/attendanceController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// All attendance routes require authentication
router.use(authenticateToken);

// Staff and Managers can manage their own attendance
router.get('/status', authorizeRoles('staff', 'manager'), getAttendanceStatus);
router.post('/check-in', authorizeRoles('staff', 'manager'), checkIn);
router.post('/check-out', authorizeRoles('staff', 'manager'), checkOut);

// Manager only: Review all attendance and override
router.get('/all', authorizeRoles('manager'), getAllAttendance);
router.put('/:id', authorizeRoles('manager'), updateAttendance);

export default router;
