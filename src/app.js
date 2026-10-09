import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.config.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';
import CustomError from './utils/customError.util.js';
import logger from './config/winston.config.js';

import authRoutes from './modules/auth/auth.route.js';
import productRoutes from './modules/product/product.route.js';
import orderRoutes from './modules/order/order.route.js';
import userRoutes from './modules/user/user.route.js';
import webhookRoutes from './modules/webhook/webhook.route.js';
import brandRoutes from './modules/brand/brand.route.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  logger.info(`Incoming Request: [${req.method}] ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Backend is healthy!' });
});

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhooks', webhookRoutes);

app.all('*', (req, res, next) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
