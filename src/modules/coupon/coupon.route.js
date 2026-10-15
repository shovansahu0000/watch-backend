import { Router } from 'express';
import couponController from './coupon.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createCouponSchema, updateCouponSchema, applyCouponSchema, removeCouponSchema } from './coupon.validate.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { restrictToAdmin } from '../../middleware/admin.middleware.js';

const router = Router();

router.post('/apply-coupon', authenticate, validate(applyCouponSchema), couponController.applyCoupon);
router.post('/remove-coupon', authenticate, validate(removeCouponSchema), couponController.removeCoupon);

router.get('/admin', restrictToAdmin, couponController.getCoupons);
router.post('/admin', restrictToAdmin, validate(createCouponSchema), couponController.createCoupon);
router.put('/admin/:id', restrictToAdmin, validate(updateCouponSchema), couponController.updateCoupon);
router.delete('/admin/:id', restrictToAdmin, couponController.deleteCoupon);

export default router;
