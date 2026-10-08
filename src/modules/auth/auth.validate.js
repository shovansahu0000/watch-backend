import Joi from 'joi';

export const sendOtpSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
    'string.pattern.base': 'Phone number must be a valid E.164 format'
  })
});

export const verifyOtpSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  otp: Joi.string().length(6).required()
});

export const googleLoginSchema = Joi.object({
  token: Joi.string().required()
});


