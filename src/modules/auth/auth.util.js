import logger from '../../config/winston.config.js';

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const dispatchSms = async (phone, otp) => {
  // Mock SMS/WhatsApp Dispatcher
  logger.info(`[MOCK SMS] Sending OTP ${otp} to phone ${phone}`);
  return true;
};
