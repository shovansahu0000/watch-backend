import Joi from 'joi';

export const createProductSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.string().valid('Male', 'Female').required(),
  price: Joi.number().positive().required(),
  stockQuantity: Joi.number().integer().min(0).required(),
  images: Joi.array().items(Joi.string().uri()),
  isBestSeller: Joi.boolean()
});

export const productQuerySchema = Joi.object({
  category: Joi.string().valid('Male', 'Female'),
  brand: Joi.string(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  isBestSeller: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});
