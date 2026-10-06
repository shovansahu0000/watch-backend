import { Schema } from 'mongoose';
import { getWriteDB, getReadDB } from '../../config/db.config.js';
import CustomError from '../../utils/customError.util.js';
import { ORDER_STATUS, TRACKING_STATUS } from '../../config/constants.js';

const orderItemSchema = new Schema({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const orderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING },
  trackingStatus: { type: String, enum: Object.values(TRACKING_STATUS), default: TRACKING_STATUS.PENDING },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
}, { timestamps: true });

export const getWriteOrder = () => {
  const conn = getWriteDB();
  if (!conn) throw new CustomError('Write database not initialized', 500);
  return conn.model('Order', orderSchema);
};

export const getReadOrder = () => {
  const conn = getReadDB();
  if (!conn) throw new CustomError('Read database not initialized', 500);
  return conn.model('Order', orderSchema);
};
