import Joi from 'joi';

export const googleLoginSchema = Joi.object({
  token: Joi.string().required()
});

export const adminSendOtpSchema = Joi.object({
  email: Joi.string().email().required()
});

export const adminVerifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required()
});
