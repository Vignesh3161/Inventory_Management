import { Router } from 'express';
import { 
  getSalesReport,
  getDailySales,
  getMonthlySales,
  getYearlySales,
  getSalesByProduct,
  getSalesByStaff,
  getSalesByCategory,
  getSalesByBrand
} from '../controllers/sales.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN')); // ADMIN is capitalized to match RBAC role conventions

router.get('/report', getSalesReport);
router.get('/daily', getDailySales);
router.get('/monthly', getMonthlySales);
router.get('/yearly', getYearlySales);
router.get('/product', getSalesByProduct);
router.get('/staff', getSalesByStaff);
router.get('/category', getSalesByCategory);
router.get('/brand', getSalesByBrand);

export default router;
