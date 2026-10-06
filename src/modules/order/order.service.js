import { v4 as uuidv4 } from 'uuid';
import { getWriteOrder } from './order.model.js';
import { getWriteProduct, getReadProduct } from '../product/product.model.js';
import CustomError from '../../utils/customError.util.js';

class OrderService {
  async createOrder(userId, items, shippingAddress) {
    const ProductWrite = getWriteProduct();
    const ProductRead = getReadProduct();
    const OrderWrite = getWriteOrder();
    
    let totalAmount = 0;
    const orderItems = [];
    const decrementedSkus = [];

    try {
      for (const item of items) {
        // Fetch current product details to get name and price
        const product = await ProductRead.findOne({ sku: item.sku }).lean();
        if (!product) {
          throw new CustomError(`Product ${item.sku} not found`, 404);
        }

        // Atomic check and update inventory
        const updatedProduct = await ProductWrite.findOneAndUpdate(
          { sku: item.sku, stockQuantity: { $gte: item.quantity } },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          throw new CustomError(`Product ${item.sku} is out of stock`, 400);
        }

        decrementedSkus.push({ sku: item.sku, quantity: item.quantity });
        
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          sku: item.sku,
          name: product.name,
          quantity: item.quantity,
          price: product.price
        });
      }

      const orderId = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;

      const order = await OrderWrite.create({
        orderId,
        user: userId,
        items: orderItems,
        totalAmount,
        shippingAddress
      });

      // Here you would typically integrate with a payment gateway to initialize payment
      const paymentData = {
        amount: totalAmount,
        currency: 'USD',
        receipt: orderId
      };

      return { order, paymentData };

    } catch (error) {
      // Rollback inventory if any item fails
      for (const reqItem of decrementedSkus) {
        await ProductWrite.updateOne(
          { sku: reqItem.sku },
          { $inc: { stockQuantity: reqItem.quantity } }
        );
      }
      throw error;
    }
  }
}

export default new OrderService();
