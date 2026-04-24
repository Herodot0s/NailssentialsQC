import { Router } from 'express';
import { getMyProfile, updateMyProfile, getCustomerHistory, searchCustomers } from '../controllers/customerController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Customer specific routes
router.get('/profile', authenticateToken, authorizeRoles('customer'), getMyProfile);
router.put('/profile', authenticateToken, authorizeRoles('customer'), updateMyProfile);

// Staff/Manager access routes for CRM
router.get('/search', authenticateToken, authorizeRoles('staff', 'manager'), searchCustomers);
router.get('/:id/history', authenticateToken, authorizeRoles('staff', 'manager'), getCustomerHistory);

export default router;
