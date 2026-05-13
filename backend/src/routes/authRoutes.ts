import { Router } from 'express';
import { getMe } from '../controllers/authController';
import { handleClerkWebhook } from '../controllers/clerkWebhookController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get current user profile (synced with Clerk via authenticateToken middleware)
router.get('/me', authenticateToken, getMe);

// Clerk Webhooks for automatic synchronization
router.post('/webhooks/clerk', handleClerkWebhook);

export default router;
