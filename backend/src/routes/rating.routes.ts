import { Router } from 'express';
import { submitOrUpdateRating } from '../controllers/rating.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Only normal users submit/modify ratings
router.post('/', authenticateJWT, authorizeRoles('USER'), submitOrUpdateRating);

export default router;
