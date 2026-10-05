import { Router } from 'express';
import { getOwnerDashboard } from '../controllers/owner.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Store owner dashboard
router.get('/dashboard', authenticateJWT, authorizeRoles('STORE_OWNER'), getOwnerDashboard);

export default router;
