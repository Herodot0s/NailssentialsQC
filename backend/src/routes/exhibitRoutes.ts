import { Router } from 'express';
import { getAllExhibits, createExhibit, deleteExhibit, updateExhibit } from '../controllers/exhibitController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public route
router.get('/', getAllExhibits);

// Protected routes (Manager only)
router.post('/', authenticateToken, authorizeRoles('manager'), createExhibit);
router.put('/:id', authenticateToken, authorizeRoles('manager'), updateExhibit);
router.delete('/:id', authenticateToken, authorizeRoles('manager'), deleteExhibit);

export default router;
