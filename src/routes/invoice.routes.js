import { Router } from 'express';
import { 
  createInvoice, 
  getAllInvoices, 
  getInvoiceById, 
  getInvoiceByNumber, 
  cancelInvoice, 
  downloadInvoicePDF 
} from '../controllers/invoice.controller.js';
import { authenticate } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.post('/', createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.get('/number/:invoiceNumber', getInvoiceByNumber);
router.put('/:id/cancel', cancelInvoice);

// Mount both endpoint patterns for maximum reliability
router.get('/:id/pdf', downloadInvoicePDF);
router.get('/:id/download', downloadInvoicePDF);

export default router;
