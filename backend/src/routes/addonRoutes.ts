import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { getAddons, createAddon, updateAddon, deleteAddon } from '../controllers/addonController';

const router = Router();

// Public route to get active addons
router.get('/', getAddons);

// Protected routes for manager
router.post('/', authenticateToken, authorizeRoles('manager', 'staff'), createAddon);
router.put('/:id', authenticateToken, authorizeRoles('manager', 'staff'), updateAddon);
router.delete('/:id', authenticateToken, authorizeRoles('manager', 'staff'), deleteAddon);

export default router;
