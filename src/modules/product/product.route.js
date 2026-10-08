import { Router } from 'express';
import productController from './product.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { productQuerySchema, createProductSchema } from './product.validate.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { restrictToAdmin } from '../../middleware/admin.middleware.js';

const router = Router();

router.get('/featured', productController.getFeaturedProducts);
router.get('/', productController.getProducts);
router.get('/:sku', productController.getProductBySku);

router.post('/admin', authenticate, restrictToAdmin, validate(createProductSchema), productController.createProduct);

export default router;
