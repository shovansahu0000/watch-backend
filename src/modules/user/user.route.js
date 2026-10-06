import { Router } from 'express';
import userController from './user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/profile', userController.getProfile);
router.post('/address', userController.addAddress);

export default router;
