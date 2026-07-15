import { Router } from 'express';
import { addProducedStock, adjustFactoryStock, adjustRetailStock, getFactoryInventory, getRetailInventory, getLowStock } from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/factory', getFactoryInventory);
router.get('/retail', getRetailInventory);
router.get('/low-stock', getLowStock);

router.post('/factory/add', authorize(['Admin', 'Stock Manager']), addProducedStock);
router.post('/factory/adjust', authorize(['Admin', 'Stock Manager']), adjustFactoryStock);
router.post('/retail/adjust', authorize(['Admin', 'Stock Manager']), adjustRetailStock);

export default router;
