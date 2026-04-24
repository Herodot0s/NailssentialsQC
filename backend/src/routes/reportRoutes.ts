import { Router } from 'express';
import { getPayrollReport, getDailySalesStats } from '../controllers/reportController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/payroll', authenticateToken, authorizeRoles('manager'), getPayrollReport);
router.get('/daily-sales', authenticateToken, authorizeRoles('manager'), getDailySalesStats);

export default router;
