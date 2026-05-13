import { Router } from 'express';
import { z } from 'zod';
import {
  getCategories,
  getServices,
  createCategory,
  updateCategory,
  createService,
  updateService,
} from '../controllers/serviceController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

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

// Public routes
router.get('/categories', getCategories);
router.get('/', getServices);

// Manager only routes
router.post('/categories', authenticateToken, authorizeRoles('manager'), createCategory);
router.put(
  '/categories/:id',
  authenticateToken,
  authorizeRoles('manager'),
  validateIdParam,
  updateCategory,
);

router.post('/', authenticateToken, authorizeRoles('manager'), createService);
router.put('/:id', authenticateToken, authorizeRoles('manager'), validateIdParam, updateService);

export default router;
