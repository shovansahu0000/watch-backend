import { Schema } from 'mongoose';
import { getWriteDB, getReadDB } from '../../config/db.config.js';
import CustomError from '../../utils/customError.util.js';

const productSchema = new Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true, index: true },
  category: { type: String, enum: ['Male', 'Female'], required: true, index: true },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  isBestSeller: { type: Boolean, default: false, index: true }
}, { timestamps: true });

export const getWriteProduct = () => {
  const conn = getWriteDB();
  if (!conn) throw new CustomError('Write database not initialized', 500);
  return conn.model('Product', productSchema);
};

export const getReadProduct = () => {
  const conn = getReadDB();
  if (!conn) throw new CustomError('Read database not initialized', 500);
  return conn.model('Product', productSchema);
};
