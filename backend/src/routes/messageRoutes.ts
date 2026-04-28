import { Router } from 'express';
import { sendMessage, getMyMessages, markAsRead } from '../controllers/messageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getMyMessages);
router.post('/', authenticateToken, sendMessage);
router.patch('/:id/read', authenticateToken, markAsRead);

export default router;
