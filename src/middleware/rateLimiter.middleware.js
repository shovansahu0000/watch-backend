import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 20,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,
  message: 'Too many requests from this IP, please try again later'
});
