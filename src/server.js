import app from './app.js';
import { env } from './config/env.config.js';
import { connectDBs, closeDBs } from './config/db.config.js';
import logger from './config/winston.config.js';

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

process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(async () => {
    logger.info('Process terminated!');
    await closeDBs();
  });
});
