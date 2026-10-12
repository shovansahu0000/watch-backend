import logger from '../config/winston.config.js';
import { deleteLocalFile } from '../utils/cloudinary.util.js';

export const errorHandler = (err, req, res, next) => {
  if (req.files) {
    Object.values(req.files).flat().forEach((file) => {
      if (file?.path) deleteLocalFile(file.path);
    });
  }
  if (req.file?.path) {
    deleteLocalFile(req.file.path);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      logger.error('ERROR', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  }
};
