import { Router } from 'express';
import { login, register, logout, getProfile, refreshToken } from '../controllers/auth.controller.js';
import { authenticate, authorize, validateRequest, userLoginSchema, userCreateSchema, userChangePasswordSchema } from '../middleware/index.js';

const router = Router();

router.post('/login', validateRequest(userLoginSchema), login);
// router.post('/register', authenticate, authorize('Admin'), validateRequest(userCreateSchema), register);
router.post('/register', register);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

router.get('/profile', authenticate, getProfile);

export default router;
