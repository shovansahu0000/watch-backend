import { Schema } from 'mongoose';
import { getWriteDB, getReadDB } from '../../config/db.config.js';
import CustomError from '../../utils/customError.util.js';

const brandSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  logo: { type: String }
}, { timestamps: true });

export const getWriteBrand = () => {
  const conn = getWriteDB();
  if (!conn) throw new CustomError('Write database not initialized', 500);
  return conn.model('Brand', brandSchema);
};

export const getReadBrand = () => {
  const conn = getReadDB();
  if (!conn) throw new CustomError('Read database not initialized', 500);
  return conn.model('Brand', brandSchema);
};
