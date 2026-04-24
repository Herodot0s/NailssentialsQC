import { Router } from 'express';
import { getCategories, getServices, createCategory, updateCategory, createService, updateService } from '../controllers/serviceController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/categories', getCategories);
router.get('/', getServices);

// Manager only routes
router.post('/categories', authenticateToken, authorizeRoles('manager'), createCategory);
router.put('/categories/:id', authenticateToken, authorizeRoles('manager'), updateCategory);

router.post('/', authenticateToken, authorizeRoles('manager'), createService);
router.put('/:id', authenticateToken, authorizeRoles('manager'), updateService);

export default router;
