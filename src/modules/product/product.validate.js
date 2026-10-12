import Joi from 'joi';

export const createProductSchema = Joi.object({
  sku: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  brand: Joi.string().trim().required(),
  category: Joi.string().valid('Male', 'Female').required(),
  price: Joi.number().positive().required(),
  mrp: Joi.number().positive().allow(null, '').optional(),
  stockQuantity: Joi.number().integer().min(0).required(),
  description: Joi.string().allow('', null).optional(),
  movement: Joi.string().allow('', null).optional(),
  caseSize: Joi.string().allow('', null).optional(),
  waterResistance: Joi.string().allow('', null).optional(),
  bestSeller: Joi.boolean().optional(),
  images: Joi.object({
    front: Joi.string().uri().optional(),
    left: Joi.string().uri().optional(),
    right: Joi.string().uri().optional(),
  }).optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim(),
  brand: Joi.string().trim(),
  category: Joi.string().valid('Male', 'Female'),
  price: Joi.number().positive(),
  mrp: Joi.number().positive().allow(null, ''),
  stockQuantity: Joi.number().integer().min(0),
  description: Joi.string().allow('', null),
  movement: Joi.string().allow('', null),
  caseSize: Joi.string().allow('', null),
  waterResistance: Joi.string().allow('', null),
  bestSeller: Joi.boolean(),
  images: Joi.object({
    front: Joi.string().uri(),
    left: Joi.string().uri(),
    right: Joi.string().uri(),
  }).optional()
}).min(0);
