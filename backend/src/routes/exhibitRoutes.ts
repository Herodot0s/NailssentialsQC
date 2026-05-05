import { Router } from 'express';
import { getAllExhibits, createExhibit, deleteExhibit } from '../controllers/exhibitController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public route
router.get('/', getAllExhibits);

// Protected routes (Manager only)
router.post('/', authenticateToken, authorizeRoles('manager'), createExhibit);
router.delete('/:id', authenticateToken, authorizeRoles('manager'), deleteExhibit);

export default router;
