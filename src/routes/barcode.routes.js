import { Router } from 'express';
import { generateBarcode, getBarcodeDetails, validateBarcode } from '../controllers/barcode.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

// Generate barcode requires Admin or Stock Manager permissions
router.post('/generate', authorize(['Admin', 'Stock Manager']), generateBarcode);

// Retrieving barcode details and validation is accessible by any authenticated role
router.post('/validate', validateBarcode);
router.get('/:barcode', getBarcodeDetails);

export default router;
