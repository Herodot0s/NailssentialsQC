import { Router } from 'express';
import { z } from 'zod';
import {
  getAttendanceStatus,
  checkIn,
  checkOut,
  getAllAttendance,
  updateAttendance,
} from '../controllers/attendanceController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
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

// All attendance routes require authentication
router.use(authenticateToken);

// Staff and Managers can manage their own attendance
router.get('/status', authorizeRoles('staff', 'manager'), getAttendanceStatus);
router.post('/check-in', authorizeRoles('staff', 'manager'), checkIn);
router.post('/check-out', authorizeRoles('staff', 'manager'), checkOut);

// Manager only: Review all attendance and override
router.get('/all', authorizeRoles('manager'), getAllAttendance);
router.put('/:id', authorizeRoles('manager'), validateIdParam, updateAttendance);

export default router;
