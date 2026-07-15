import { Router } from 'express';
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getProductById, 
  getAllProducts, 
  getProductByBarcode, 
  uploadProductImage,
  searchProducts,
  filterProducts,
  updateProductStockStatus
} from '../controllers/product.controller.js';
import { authenticate, authorize, validateRequest, productSchema, upload } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

// Specific routes must be declared BEFORE parameter routes to prevent Express routing conflicts
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/filter', filterProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProductById);

// Restricted operations (Admin and Stock Manager)
router.post('/', authorize(['Admin', 'Stock Manager']), validateRequest(productSchema), addProduct);
router.put('/:id', authorize(['Admin', 'Stock Manager']), updateProduct);
router.delete('/:id', authorize('Admin'), deleteProduct);

// Image uploading & stock status updates
router.post('/:productId/images', authorize(['Admin', 'Stock Manager']), upload.single('image'), uploadProductImage);
router.put('/:id/stock-status', authorize(['Admin', 'Stock Manager']), updateProductStockStatus);

// Deprecated/general upload route (kept for backwards compatibility)
router.post('/upload', authorize(['Admin', 'Stock Manager']), upload.single('image'), uploadProductImage);

export default router;
