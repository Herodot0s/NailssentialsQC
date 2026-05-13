import { Router } from 'express';
import { z } from 'zod';
import {
  generatePayroll,
  getPayrollPeriods,
  getPayrollDetails,
  addDeduction,
  getMyPayroll,
  lockPayroll,
  exportPayrollExcel,
} from '../controllers/payrollController';
import {
  getSalaryComponents,
  createSalaryComponent,
  getSalaryStructures,
  createSalaryStructure,
  getAssignments,
  createAssignment,
} from '../controllers/payrollSetupController';
import { authenticateToken, authorizeRoles, validateZod } from '../middleware/authMiddleware';
import {
  generatePayrollSchema,
  addDeductionSchema,
  salaryComponentSchema,
  salaryStructureSchema,
  salaryStructureAssignmentSchema,
} from '../validators/payrollSchemas';

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const validateIdParam = (req: any, res: any, next: any) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' },
    });
  }
  req.validatedParams = result.data;
  next();
};

const router = Router();

router.get('/my-payroll', authenticateToken, authorizeRoles('staff', 'manager'), getMyPayroll);
/**
 * GET /api/payroll/periods
 * @query {string} [cursor] - Cursor ID for pagination (last ID from previous page, D-09)
 * @query {number} [limit=20] - Number of items per page (max 100, D-10)
 * @returns { success: boolean, data: { items: PayrollPeriod[], nextCursor: string | null, hasMore: boolean } } (D-11)
 */
router.get('/periods', authenticateToken, authorizeRoles('manager'), getPayrollPeriods);
router.get(
  '/periods/:id',
  authenticateToken,
  authorizeRoles('manager'),
  validateIdParam,
  getPayrollDetails,
);
router.post(
  '/generate',
  authenticateToken,
  authorizeRoles('manager'),
  validateZod(generatePayrollSchema),
  generatePayroll,
);
router.post(
  '/deductions',
  authenticateToken,
  authorizeRoles('manager'),
  validateZod(addDeductionSchema),
  addDeduction,
);
router.patch(
  '/periods/:id/lock',
  authenticateToken,
  authorizeRoles('manager'),
  validateIdParam,
  lockPayroll,
);
router.get(
  '/export/:id',
  authenticateToken,
  authorizeRoles('manager'),
  validateIdParam,
  exportPayrollExcel,
);

// --- Payroll Setup Routes ---
router.get('/components', authenticateToken, authorizeRoles('manager'), getSalaryComponents);
router.post(
  '/components',
  authenticateToken,
  authorizeRoles('manager'),
  validateZod(salaryComponentSchema),
  createSalaryComponent,
);

router.get('/structures', authenticateToken, authorizeRoles('manager'), getSalaryStructures);
router.post(
  '/structures',
  authenticateToken,
  authorizeRoles('manager'),
  validateZod(salaryStructureSchema),
  createSalaryStructure,
);

router.get('/assignments', authenticateToken, authorizeRoles('manager'), getAssignments);
router.post(
  '/assignments',
  authenticateToken,
  authorizeRoles('manager'),
  validateZod(salaryStructureAssignmentSchema),
  createAssignment,
);

export default router;
