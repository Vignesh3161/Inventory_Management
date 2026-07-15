import { Router } from 'express';
import { createRole, getAllRoles, getRoleById, updateRole, deleteRole } from '../controllers/role.controller.js';
import { authenticate, authorize, validateRequest, roleSchema } from '../middleware/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('Admin')); // Only admins can manage roles

router.get('/', getAllRoles);
router.post('/', validateRequest(roleSchema), createRole);
router.get('/:id', getRoleById);
router.put('/:id', validateRequest(roleSchema), updateRole);
router.delete('/:id', deleteRole);

export default router;
