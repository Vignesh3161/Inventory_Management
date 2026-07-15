import { Router } from 'express';
import { processReturn, getReturnHistory } from '../controllers/return.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['ADMIN', 'STAFF']), processReturn);
router.get('/history', getReturnHistory);

export default router;
