import Redis from 'ioredis';
import { env } from './env.config.js';
import logger from './winston.config.js';

const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('connect', () => {
  logger.info('Redis Connected Successfully');
});

redisClient.on('error', (err) => {
  logger.error(`Redis Error: ${err.message}`);
});

export default redisClient;
