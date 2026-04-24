import { Router } from 'express';
import { getAllStaff, createStaff, updateStaff } from '../controllers/staffController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// All staff routes are restricted to managers
router.use(authenticateToken);
router.use(authorizeRoles('manager'));

router.get('/', getAllStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);

export default router;
