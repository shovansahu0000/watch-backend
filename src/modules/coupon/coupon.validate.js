import Joi from 'joi';

export const createCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required().messages({
    'string.empty': 'Coupon code is required',
    'any.required': 'Coupon code is required'
  }),
  discountType: Joi.string().valid('fixed', 'percentage').required().messages({
    'any.only': 'Discount type must be either "fixed" or "percentage"',
    'any.required': 'Discount type is required'
  }),
  discountValue: Joi.number().positive().min(1).when('discountType', {
    is: 'percentage',
    then: Joi.number().max(100).messages({
      'number.max': 'Percentage discount cannot exceed 100%'
    })
  }).required().messages({
    'number.base': 'Discount value must be a number',
    'any.required': 'Discount value is required'
  }),
  expiresAt: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Expiration date must be in the future',
    'any.required': 'Expiration date is required'
  }),
  isActive: Joi.boolean().default(true)
});

export const updateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().optional(),
  discountType: Joi.string().valid('fixed', 'percentage'),
  discountValue: Joi.number().positive().min(1).when('discountType', {
    is: 'percentage',
    then: Joi.number().max(100)
  }),
  expiresAt: Joi.date().iso(),
  isActive: Joi.boolean()
}).unknown(true);

export const applyCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required().messages({
    'string.empty': 'Coupon code is required',
    'any.required': 'Coupon code is required'
  }),
  items: Joi.array().items(
    Joi.object({
      sku: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).optional(),
  subtotal: Joi.number().min(0).optional()
});

export const removeCouponSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      sku: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).optional(),
  subtotal: Joi.number().min(0).optional()
});
