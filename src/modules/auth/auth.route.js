import { Router } from 'express';
import authController from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { googleLoginSchema, adminSendOtpSchema, adminVerifyOtpSchema } from './auth.validate.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/google', authLimiter, validate(googleLoginSchema), authController.googleLogin);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);

router.post('/admin/send-otp', authLimiter, validate(adminSendOtpSchema), authController.adminSendOtp);
router.post('/admin/verify-otp', authLimiter, validate(adminVerifyOtpSchema), authController.adminVerifyOtp);
router.post('/admin/logout', authenticate, authController.adminLogout);

export default router;
