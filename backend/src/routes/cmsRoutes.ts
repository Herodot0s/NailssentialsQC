import { Router } from 'express';
import {
  getSettings,
  saveSettings,
  getContent,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers/cmsController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public routes — no authentication required
router.get('/settings', getSettings);
router.get('/content', getContent);

// Manager-only routes — require valid JWT + manager role
router.put('/settings', authenticateToken, authorizeRoles('manager'), saveSettings);
router.post('/content', authenticateToken, authorizeRoles('manager'), createContent);
router.put('/content/:id', authenticateToken, authorizeRoles('manager'), updateContent);
router.delete('/content/:id', authenticateToken, authorizeRoles('manager'), deleteContent);

export default router;
