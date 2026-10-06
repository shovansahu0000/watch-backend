import jwt from 'jsonwebtoken';
import redisClient from '../../config/redis.config.js';
import { REDIS_KEYS } from '../../config/constants.js';
import { getWriteUser, getReadUser } from './auth.model.js';
import { generateOtp, dispatchSms } from './auth.util.js';
import CustomError from '../../utils/customError.util.js';
import { env } from '../../config/env.config.js';

class AuthService {
  async sendOtp(phone) {
    const otp = generateOtp();
    const redisKey = REDIS_KEYS.OTP(phone);
    
    // Save to Redis with 300s (5 min) TTL
    await redisClient.setex(redisKey, 300, otp);
    
    // Dispatch SMS
    await dispatchSms(phone, otp);
    
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phone, otp) {
    const redisKey = REDIS_KEYS.OTP(phone);
    const storedOtp = await redisClient.get(redisKey);
    
    if (!storedOtp) {
      throw new CustomError('OTP expired or invalid', 400);
    }
    
    if (storedOtp !== otp) {
      throw new CustomError('Invalid OTP', 400);
    }
    
    // Delete OTP after successful verification
    await redisClient.del(redisKey);
    
    // Find or create user
    const UserWrite = getWriteUser();
    let user = await UserWrite.findOne({ phone });
    if (!user) {
      user = await UserWrite.create({ phone });
    }
    
    // Generate JWTs
    const accessToken = jwt.sign({ id: user._id, role: user.role }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    });
    
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN
    });
    
    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    return { user, accessToken, refreshToken };
  }

  async getMe(userId) {
    const UserRead = getReadUser();
    const user = await UserRead.findById(userId);
    if (!user) throw new CustomError('User not found', 404);
    return user;
  }

  async refreshAccessToken(token) {
    if (!token) throw new CustomError('Refresh token is required', 401);
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    
    const UserRead = getReadUser();
    const user = await UserRead.findById(decoded.id);
    
    if (!user || user.refreshToken !== token) {
      throw new CustomError('Invalid refresh token', 401);
    }
    
    const accessToken = jwt.sign({ id: user._id, role: user.role }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    });
    
    return { accessToken };
  }

  async logout(userId) {
    const UserWrite = getWriteUser();
    await UserWrite.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

export default new AuthService();
