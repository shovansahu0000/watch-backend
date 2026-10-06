import { Router } from 'express';
import orderController from './order.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { checkoutSchema } from './order.validate.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.post('/create', validate(checkoutSchema), orderController.createOrder);

export default router;
