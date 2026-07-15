import { Router } from 'express';
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { authenticate, authorize, validateRequest, categorySchema } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllCategories);
router.post('/', authorize(['Admin', 'Stock Manager']), validateRequest(categorySchema), createCategory);
router.put('/:id', authorize(['Admin', 'Stock Manager']), validateRequest(categorySchema), updateCategory);
router.delete('/:id', authorize('Admin'), deleteCategory);

export default router;
