import { Router } from 'express';
import { getStaffDashboardData, getManagerDashboardData } from '../controllers/dashboardController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication to all dashboard routes
router.use(authenticateToken);

// Staff Dashboard consolidated endpoint
router.get('/staff', authorizeRoles('staff', 'manager'), getStaffDashboardData);

// Manager Dashboard consolidated endpoint
router.get('/manager', authorizeRoles('manager'), getManagerDashboardData);

export default router;
