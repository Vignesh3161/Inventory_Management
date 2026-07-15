import { Router } from 'express';
import { createBrand, getAllBrands, updateBrand, deleteBrand } from '../controllers/brand.controller.js';
import { authenticate, authorize, validateRequest, brandSchema } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllBrands);
router.post('/', authorize(['Admin', 'Stock Manager']), validateRequest(brandSchema), createBrand);
router.put('/:id', authorize(['Admin', 'Stock Manager']), validateRequest(brandSchema), updateBrand);
router.delete('/:id', authorize('Admin'), deleteBrand);

export default router;
