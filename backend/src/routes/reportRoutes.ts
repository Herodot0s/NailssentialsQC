import { Router } from 'express';
import { getPayrollReport, getDailySalesStats, getHistoricalAnalytics } from '../controllers/reportController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/payroll', authenticateToken, authorizeRoles('manager'), getPayrollReport);
router.get('/daily-sales', authenticateToken, authorizeRoles('manager'), getDailySalesStats);
router.get('/historical-analytics', authenticateToken, authorizeRoles('manager'), getHistoricalAnalytics);

export default router;
