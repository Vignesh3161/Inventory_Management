import { Router } from 'express';
import { 
  scanBarcode, 
  searchProduct, 
  addItem, 
  updateQuantity, 
  removeItem, 
  generateBillFromDraft, 
  processPayment,
  getBillDetails
} from '../controllers/billing.controller.js';
import { authenticate } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

// Scan and Search endpoints
router.post('/scan', scanBarcode);
router.get('/search', searchProduct);

// Items manipulation
router.post('/items', addItem);
router.put('/items/:itemId', updateQuantity);
router.delete('/items/:itemId', removeItem);

// Document compilation & Settlement
router.post('/generate', generateBillFromDraft);
router.post('/payment', processPayment);

// Legacy lookup
router.get('/:id', getBillDetails);

export default router;
