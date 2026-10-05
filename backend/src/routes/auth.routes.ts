import { Router } from 'express';
import { signup, login, updatePassword, getMe } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/update-password', authenticateJWT, updatePassword);
router.get('/me', authenticateJWT, getMe);

export default router;
