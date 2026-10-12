import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import logger from '../config/winston.config.js';
import { env } from '../config/env.config.js';
import CustomError from './customError.util.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

export const deleteLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Cleaned up local file: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error deleting local file ${filePath}: ${error.message}`);
  }
};

export const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
};

export const uploadOnCloudinary = async (localFilePath, folder = 'watches') => {
  if (!localFilePath) {
    throw new CustomError('No file provided for Cloudinary upload', 400);
  }

  const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    deleteLocalFile(localFilePath);
    throw new CustomError(
      'Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.',
      500
    );
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
    });

    deleteLocalFile(localFilePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    deleteLocalFile(localFilePath);
    logger.error(`Cloudinary upload failed: ${error.message}`);
    throw new CustomError(`Failed to upload image to Cloudinary: ${error.message}`, 500);
  }
};

export const deleteFromCloudinary = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) return null;

  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    publicId = extractPublicId(publicIdOrUrl);
  }

  if (!publicId) {
    logger.warn(`Could not determine public_id for deletion: ${publicIdOrUrl}`);
    return null;
  }

  const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    logger.warn('Cloudinary not configured; skipping deletion from Cloudinary.');
    return null;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
    logger.info(`Cloudinary image deleted: ${publicId} (result: ${result.result})`);
    return result;
  } catch (error) {
    logger.error(`Failed to delete image from Cloudinary (${publicId}): ${error.message}`);
    return null;
  }
};

export default {
  uploadOnCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  deleteLocalFile,
};
