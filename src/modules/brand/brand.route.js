import { Router } from 'express';
import brandController from './brand.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createBrandSchema, updateBrandSchema } from './brand.validate.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { restrictToAdmin } from '../../middleware/admin.middleware.js';

const router = Router();

router.get('/', brandController.getBrands);

router.post('/admin', authenticate, restrictToAdmin, validate(createBrandSchema), brandController.createBrand);
router.put('/admin/:id', authenticate, restrictToAdmin, validate(updateBrandSchema), brandController.updateBrand);
router.delete('/admin/:id', authenticate, restrictToAdmin, brandController.deleteBrand);

export default router;
