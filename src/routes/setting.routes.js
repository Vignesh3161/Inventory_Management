import { Router } from 'express';
import { 
  getSettings, 
  updateGST, 
  updateDiscount, 
  updateInvoicePrefix, 
  updateShopInfo 
} from '../controllers/setting.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

// Publicly read settings (needed for cashiers/POS to display shop information, prefix, GST)
router.get('/', getSettings);

// Admin-only updates
router.put('/gst', authorize('ADMIN'), updateGST);
router.put('/discount', authorize('ADMIN'), updateDiscount);
router.put('/invoice-prefix', authorize('ADMIN'), updateInvoicePrefix);
router.put('/shop', authorize('ADMIN'), updateShopInfo);

export default router;
