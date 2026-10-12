import { Schema } from 'mongoose';
import { getWriteDB, getReadDB } from '../../config/db.config.js';
import CustomError from '../../utils/customError.util.js';
import { CATEGORIES } from '../../config/constants.js';

const productSchema = new Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true, index: true },
  category: { type: String, enum: Object.values(CATEGORIES), required: true, index: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  stockQuantity: { type: Number, required: true, min: 0, default: 0 },
  images: {
    front: { type: String, required: true },
    left: { type: String, required: true },
    right: { type: String, required: true },
  },
  imagePublicIds: {
    front: { type: String },
    left: { type: String },
    right: { type: String },
  },
  image: { type: String },
  description: { type: String },
  movement: { type: String },
  caseSize: { type: String },
  waterResistance: { type: String },
  bestSeller: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.pre('save', function (next) {
  if (this.images?.front) {
    this.image = this.images.front;
  }
  next();
});

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
