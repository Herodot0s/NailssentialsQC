import { Router } from 'express';
import { generatePayroll, getPayrollPeriods, getPayrollDetails, addDeduction, getMyPayroll, lockPayroll } from '../controllers/payrollController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/my-payroll', authenticateToken, authorizeRoles('staff', 'manager'), getMyPayroll);
router.get('/periods', authenticateToken, authorizeRoles('manager'), getPayrollPeriods);
router.get('/periods/:id', authenticateToken, authorizeRoles('manager'), getPayrollDetails);
router.post('/generate', authenticateToken, authorizeRoles('manager'), generatePayroll);
router.post('/deductions', authenticateToken, authorizeRoles('manager'), addDeduction);
router.patch('/periods/:id/lock', authenticateToken, authorizeRoles('manager'), lockPayroll);

export default router;
