import { Router } from 'express';
import { 
  transferFactoryToRetail, 
  transferFactoryToOnline, 
  getTransferHistory,
  cancelTransfer
} from '../controllers/transfer.controller.js';
import { authenticate, authorize, validateRequest, transferSchema } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

// History endpoint declared before parameter endpoints to avoid conflict
router.get('/history', authorize(['Admin', 'Stock Manager']), getTransferHistory);

router.post('/retail', authorize(['Admin', 'Stock Manager']), validateRequest(transferSchema), transferFactoryToRetail);
router.post('/online', authorize(['Admin', 'Stock Manager']), validateRequest(transferSchema), transferFactoryToOnline);
router.put('/:transferId/cancel', authorize(['Admin', 'Stock Manager']), cancelTransfer);

export default router;
