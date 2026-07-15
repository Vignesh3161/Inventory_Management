import { Router } from 'express';
import { 
  addProducedStock, 
  updateFactoryStock, 
  removeFactoryStock, 
  adjustFactoryStock, 
  getFactoryInventory, 
  getFactoryStockHistory 
} from '../controllers/factoryInventory.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['Admin', 'Stock Manager']));

// History and adjustment endpoints must be declared before parameter endpoints
router.get('/history', getFactoryStockHistory);
router.put('/adjust', adjustFactoryStock);

router.get('/', getFactoryInventory);
router.post('/', addProducedStock);
router.put('/:productId', updateFactoryStock);
router.delete('/:productId', removeFactoryStock);

export default router;
