import app from './app.js';
import { env } from './config/env.config.js';
import { connectDBs, closeDBs } from './config/db.config.js';
import logger from './config/winston.config.js';
import redisClient from './config/redis.config.js';

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});

connectDBs();

const server = app.listen(env.PORT, () => {
  logger.info(`App running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} RECEIVED. Shutting down gracefully...`);
  
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    logger.info('HTTP Server closed');
    await closeDBs();
    logger.info('MongoDB connections closed');
    await redisClient.quit();
    logger.info('Redis connection closed');
    logger.info('Process terminated safely!');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
