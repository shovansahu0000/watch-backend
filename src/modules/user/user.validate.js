import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  phone: Joi.string().allow('', null).optional(),
  name: Joi.string().allow('', null).optional(),
  address: Joi.object({
    line1: Joi.string().allow('', null).optional(),
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    postalCode: Joi.string().allow('', null).optional(),
    country: Joi.string().allow('', null).optional()
  }).optional()
});
