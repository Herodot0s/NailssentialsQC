import { Router } from 'express';
import { z } from 'zod';
import { generatePayroll, getPayrollPeriods, getPayrollDetails, addDeduction, getMyPayroll, lockPayroll } from '../controllers/payrollController';
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

router.get('/my-payroll', authenticateToken, authorizeRoles('staff', 'manager'), getMyPayroll);
router.get('/periods', authenticateToken, authorizeRoles('manager'), getPayrollPeriods);
router.get('/periods/:id', authenticateToken, authorizeRoles('manager'), validateIdParam, getPayrollDetails);
router.post('/generate', authenticateToken, authorizeRoles('manager'), generatePayroll);
router.post('/deductions', authenticateToken, authorizeRoles('manager'), addDeduction);
router.patch('/periods/:id/lock', authenticateToken, authorizeRoles('manager'), validateIdParam, lockPayroll);

export default router;
