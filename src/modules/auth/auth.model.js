import { Schema } from 'mongoose';
import { getWriteDB, getReadDB } from '../../config/db.config.js';
import CustomError from '../../utils/customError.util.js';
import { ROLES } from '../../config/constants.js';

const userSchema = new Schema({
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
  name: { type: String },
  picture: { type: String },
  address: {
    line1: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  refreshToken: { type: String }
}, { timestamps: true });

export const getWriteUser = () => {
  const conn = getWriteDB();
  if (!conn) throw new CustomError('Write database not initialized', 500);
  return conn.model('User', userSchema);
};

export const getReadUser = () => {
  const conn = getReadDB();
  if (!conn) throw new CustomError('Read database not initialized', 500);
  return conn.model('User', userSchema);
};
