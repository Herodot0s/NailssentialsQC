import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import {
  getAllPackages,
  getActivePackages,
  getPackage,
  createPackage,
  updatePackage,
  togglePackage,
  deletePackage,
} from '../controllers/packageController';

const router = Router();

// Public endpoints (no auth)
router.get('/active', getActivePackages);
router.get('/:id', getPackage);

// Manager-only endpoints
router.get('/', authenticateToken, authorizeRoles('manager'), getAllPackages);
router.post('/', authenticateToken, authorizeRoles('manager'), createPackage);
router.put('/:id', authenticateToken, authorizeRoles('manager'), updatePackage);
router.patch('/:id/toggle', authenticateToken, authorizeRoles('manager'), togglePackage);
router.delete('/:id', authenticateToken, authorizeRoles('manager'), deletePackage);

export default router;
