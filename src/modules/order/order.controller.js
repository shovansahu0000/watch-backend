import orderService from './order.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class OrderController {
  createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress } = req.body;
    const userId = req.user._id;
    
    const result = await orderService.createOrder(userId, items, shippingAddress);
    return ApiResponse.success(res, result, 'Order created successfully', 201);
  });
}

export default new OrderController();
