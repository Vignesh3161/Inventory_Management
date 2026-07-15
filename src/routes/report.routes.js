import { Router } from 'express';
import { 
  getDashboardSummary,
  getSalesReport,
  getInventoryReport,
  getFactoryInventoryReport,
  getRetailInventoryReport,
  getStockTransferReport,
  getGSTReport,
  getProfitReport,
  getLowStockReport,
  getBestSellingProducts
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN')); // ADMIN capitalized to match RBAC role conventions

router.get('/dashboard', getDashboardSummary);
router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/factory-inventory', getFactoryInventoryReport);
router.get('/retail-inventory', getRetailInventoryReport);
router.get('/stock-transfer', getStockTransferReport);
router.get('/gst', getGSTReport);
router.get('/profit', getProfitReport);
router.get('/low-stock', getLowStockReport);
router.get('/best-selling', getBestSellingProducts);

export default router;
