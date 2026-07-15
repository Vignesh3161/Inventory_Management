import { Router } from 'express';
import { 
  receiveStock, 
  updateRetailStock, 
  adjustRetailStock, 
  getRetailInventory, 
  getLowStock, 
  getRetailStockHistory 
} from '../controllers/retailInventory.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

// Specific routes must be declared before parameter routes to prevent routing conflicts
router.post('/receive', authorize(['Admin', 'Stock Manager']), receiveStock);
router.put('/adjust', authorize(['Admin', 'Stock Manager']), adjustRetailStock);
router.get('/low-stock', authorize(['Admin', 'Stock Manager', 'Staff']), getLowStock);
router.get('/history', authorize(['Admin', 'Stock Manager']), getRetailStockHistory);

router.get('/', authorize(['Admin', 'Stock Manager', 'Staff']), getRetailInventory);
router.put('/:productId', authorize(['Admin', 'Stock Manager']), updateRetailStock);

export default router;
