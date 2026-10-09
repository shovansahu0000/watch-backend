import Joi from 'joi';

export const createProductSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.string().valid('Male', 'Female').required(),
  price: Joi.number().positive().required(),
  mrp: Joi.number().positive().optional(),
  stockQuantity: Joi.number().integer().min(0).required(),
  image: Joi.string().uri().required(),
  description: Joi.string().optional(),
  movement: Joi.string().optional(),
  caseSize: Joi.string().optional(),
  waterResistance: Joi.string().optional(),
  bestSeller: Joi.boolean().optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string(),
  brand: Joi.string(),
  category: Joi.string().valid('Male', 'Female'),
  price: Joi.number().positive(),
  mrp: Joi.number().positive(),
  stockQuantity: Joi.number().integer().min(0),
  image: Joi.string().uri(),
  description: Joi.string(),
  movement: Joi.string(),
  caseSize: Joi.string(),
  waterResistance: Joi.string(),
  bestSeller: Joi.boolean()
}).min(1);
