import Joi from 'joi';

export const createBrandSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  logo: Joi.string().uri().allow('', null).optional()
});

export const updateBrandSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow('', null),
  logo: Joi.string().uri().allow('', null)
}).min(1);
