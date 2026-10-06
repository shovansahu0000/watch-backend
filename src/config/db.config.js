import mongoose from 'mongoose';
import { env } from './env.config.js';
import logger from './winston.config.js';

let writeConnection;
let readConnection;

export const connectDBs = () => {
  writeConnection = mongoose.createConnection(env.MONGO_URI_WRITE, {
    maxPoolSize: 20,
    minPoolSize: 5
  });

  writeConnection.on('connected', () => logger.info('MongoDB Write Connection Established'));
  writeConnection.on('error', (err) => logger.error(`MongoDB Write Error: ${err.message}`));

  readConnection = mongoose.createConnection(env.MONGO_URI_READ, {
    maxPoolSize: 30,
    minPoolSize: 5,
    readPreference: 'secondaryPreferred'
  });

  readConnection.on('connected', () => logger.info('MongoDB Read Connection Established'));
  readConnection.on('error', (err) => logger.error(`MongoDB Read Error: ${err.message}`));
};

export const getWriteDB = () => writeConnection;
export const getReadDB = () => readConnection;

export const closeDBs = async () => {
  if (writeConnection) await writeConnection.close();
  if (readConnection) await readConnection.close();
};
