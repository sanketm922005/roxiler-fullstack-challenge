import { Router } from 'express';
import { getStoresForUser } from '../controllers/store.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Normal user can view stores and search
router.get('/', authenticateJWT, getStoresForUser);

export default router;
