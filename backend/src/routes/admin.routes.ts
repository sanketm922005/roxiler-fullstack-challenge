import { Router } from 'express';
import {
  getAdminStats,
  addUser,
  addStore,
  listUsers,
  listStores,
  getAvailableStoreOwners,
} from '../controllers/admin.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticateJWT, authorizeRoles('ADMIN'));

router.get('/stats', getAdminStats);
router.post('/users', addUser);
router.get('/users', listUsers);
router.post('/stores', addStore);
router.get('/stores', listStores);
router.get('/available-owners', getAvailableStoreOwners);

export default router;
