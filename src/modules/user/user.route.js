import { Router } from 'express';
import userController from './user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateProfileSchema } from './user.validate.js';

const router = Router();

router.use(authenticate);
router.get('/me', userController.getMe);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

export default router;
