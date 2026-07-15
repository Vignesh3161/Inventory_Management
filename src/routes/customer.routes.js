import { Router } from 'express';
import { 
  addCustomer, 
  getCustomerById, 
  getCustomerByMobile, 
  getAllCustomers, 
  updateCustomer, 
  deleteCustomer,
  getCustomerPurchases
} from '../controllers/customer.controller.js';
import { authenticate, authorize } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.get('/mobile/:mobile', getCustomerByMobile);
router.get('/:id/purchases', getCustomerPurchases);

router.post('/', authorize(['ADMIN', 'STAFF']), addCustomer);
router.put('/:id', authorize(['ADMIN', 'STAFF']), updateCustomer);
router.delete('/:id', authorize('ADMIN'), deleteCustomer);

export default router;
