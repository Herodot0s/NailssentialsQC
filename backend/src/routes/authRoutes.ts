import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/authController';
import { authenticateToken, validateZod } from '../middleware/authMiddleware';
import { registerSchema, loginSchema } from '../validators/authSchemas';
import rateLimit from 'express-rate-limit';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again after 15 minutes',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const router = Router();

router.post('/register', authRateLimiter, validateZod(registerSchema), register);
router.post('/login', authRateLimiter, validateZod(loginSchema), login);
router.post('/refresh', authRateLimiter, refresh);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);

export default router;
