import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getMyProfile,
  updateMyProfile,
  getCustomerHistory,
  searchCustomers,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController';
import { authenticateToken, authorizeRoles, validateZod } from '../middleware/authMiddleware';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customerSchemas';

// Zod schemas for validation
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

// Validation middleware
const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' },
    });
  }
  (req as any).validatedParams = result.data;
  next();
};

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Customer specific routes
router.get('/profile', authorizeRoles('customer'), getMyProfile);
router.put('/profile', authorizeRoles('customer'), updateMyProfile);

// Staff/Manager access routes for CRM
router.get('/search', authorizeRoles('staff', 'manager'), searchCustomers);
router.get('/:id/history', authorizeRoles('staff', 'manager'), getCustomerHistory);

// Manager-only CRM CRUD operations
router.get('/', authorizeRoles('manager'), getAllCustomers);
router.post('/', authorizeRoles('manager'), validateZod(createCustomerSchema), createCustomer);
router.put(
  '/:id',
  authorizeRoles('manager'),
  validateIdParam,
  validateZod(updateCustomerSchema),
  updateCustomer,
);
router.delete('/:id', authorizeRoles('manager'), validateIdParam, deleteCustomer);

export default router;
