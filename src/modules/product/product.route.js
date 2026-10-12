import { Router } from 'express';
import productController from './product.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema } from './product.validate.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { restrictToAdmin } from '../../middleware/admin.middleware.js';
import { uploadWatchImages } from '../../middleware/upload.middleware.js';

const router = Router();

router.get('/featured', productController.getFeaturedProducts);
router.get('/', productController.getProducts);
router.get('/:sku', productController.getProductBySku);

router.post('/admin', authenticate, restrictToAdmin, uploadWatchImages, validate(createProductSchema), productController.createProduct);
router.put('/admin/:sku', authenticate, restrictToAdmin, uploadWatchImages, validate(updateProductSchema), productController.updateProduct);
router.delete('/admin/:sku', authenticate, restrictToAdmin, productController.deleteProduct);

export default router;
