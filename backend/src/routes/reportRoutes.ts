import { Router } from 'express';
import {
  getPayrollReport,
  getDailySalesStats,
  getHistoricalAnalytics,
} from '../controllers/reportController';
import {
  getStaffPerformance,
  getRetentionAnalytics,
  getKpiSummary,
} from '../controllers/analyticsController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/payroll', authenticateToken, authorizeRoles('manager'), getPayrollReport);
router.get('/daily-sales', authenticateToken, authorizeRoles('manager'), getDailySalesStats);
router.get(
  '/historical-analytics',
  authenticateToken,
  authorizeRoles('manager'),
  getHistoricalAnalytics,
);

// Analytics endpoints
router.get('/staff-performance', authenticateToken, authorizeRoles('manager'), getStaffPerformance);
router.get('/retention', authenticateToken, authorizeRoles('manager'), getRetentionAnalytics);
router.get('/kpi-summary', authenticateToken, authorizeRoles('manager'), getKpiSummary);

export default router;
