import webhookService from './webhook.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class WebhookController {
  payment = asyncHandler(async (req, res) => {
    // Assume signature is in headers
    const signature = req.headers['x-payment-signature'];
    const result = await webhookService.handlePayment(req.body, signature);
    return ApiResponse.success(res, result, 'Payment webhook processed');
  });

  shipping = asyncHandler(async (req, res) => {
    const result = await webhookService.handleShipping(req.body);
    return ApiResponse.success(res, result, 'Shipping webhook processed');
  });
}

export default new WebhookController();
