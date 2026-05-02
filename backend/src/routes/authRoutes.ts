import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, refresh, logout, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
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

const registerValidation = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone('any').withMessage('Invalid phone number'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        },
      });
    }
    
    // Custom check: either email or phone must be provided
    if (!req.body.email && !req.body.phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Either email or phone number is required',
        },
      });
    }
    
    next();
  },
];

const loginValidation = [
  body('identifier').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        },
      });
    }
    next();
  },
];

router.post('/register', authRateLimiter, registerValidation, register);
router.post('/login', authRateLimiter, loginValidation, login);
router.post('/refresh', authRateLimiter, refresh);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);

export default router;
