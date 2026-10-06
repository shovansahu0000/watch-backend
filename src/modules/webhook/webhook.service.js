import { getWriteOrder } from '../order/order.model.js';
import CustomError from '../../utils/customError.util.js';
import { ORDER_STATUS, TRACKING_STATUS } from '../../config/constants.js';

class WebhookService {
  async handlePayment(payload, signature) {
    // In reality, you'd verify the signature here using crypto (e.g. Razorpay/Cashfree)
    const { receipt: orderId, status } = payload;
    
    if (status !== 'captured') {
      throw new CustomError('Payment not captured', 400);
    }
    
    const OrderWrite = getWriteOrder();
    const order = await OrderWrite.findOneAndUpdate(
      { orderId },
      { paymentStatus: ORDER_STATUS.PAID },
      { new: true }
    );
    
    if (!order) {
      throw new CustomError('Order not found', 404);
    }
    
    return order;
  }

  async handleShipping(payload) {
    const { orderId, status } = payload;
    
    if (!Object.values(TRACKING_STATUS).includes(status)) {
      throw new CustomError('Invalid tracking status', 400);
    }
    
    const OrderWrite = getWriteOrder();
    const order = await OrderWrite.findOneAndUpdate(
      { orderId },
      { trackingStatus: status },
      { new: true }
    );
    
    if (!order) {
      throw new CustomError('Order not found', 404);
    }
    
    return order;
  }
}

export default new WebhookService();
