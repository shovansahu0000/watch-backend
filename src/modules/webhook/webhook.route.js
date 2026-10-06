import { Router } from 'express';
import webhookController from './webhook.controller.js';

const router = Router();

router.post('/payment', webhookController.payment);
router.post('/shipping', webhookController.shipping);

export default router;
