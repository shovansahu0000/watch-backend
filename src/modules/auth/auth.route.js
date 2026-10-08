import { Router } from 'express';
import authController from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { sendOtpSchema, verifyOtpSchema, googleLoginSchema } from './auth.validate.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';

const router = Router();

// router.post('/send-otp', authLimiter, validate(sendOtpSchema), authController.sendOtp);
// router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/google', authLimiter, validate(googleLoginSchema), authController.googleLogin);
router.post('/logout', authenticate, authController.logout);

router.post('/refresh-token', authController.refreshToken);

export default router;
