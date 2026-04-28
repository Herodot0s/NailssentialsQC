import { Router } from 'express';
import { submitReview, getStaffReviews, getAllReviews, moderateReview, getPublicReviews } from '../controllers/reviewController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/public', getPublicReviews as any);
router.get('/staff/:staffId', authenticateToken, getStaffReviews);
router.get('/', authenticateToken, authorizeRoles('manager'), getAllReviews);
router.post('/', authenticateToken, authorizeRoles('customer'), submitReview);
router.patch('/:id/moderate', authenticateToken, authorizeRoles('manager'), moderateReview);

export default router;
