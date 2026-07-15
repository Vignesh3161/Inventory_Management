import { Router } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  changePassword 
} from '../controllers/user.controller.js';
import { getProfile } from '../controllers/auth.controller.js';
import { authenticate, authorize, validateRequest, userCreateSchema, userChangePasswordSchema } from '../middleware/index.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get currently logged-in user's profile
router.get('/profile', getProfile);

// Admin-only operations
router.use(authorize('Admin'));

// Change password: Only Admin can change passwords
router.put('/change-password', validateRequest(userChangePasswordSchema), changePassword);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validateRequest(userCreateSchema), createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
