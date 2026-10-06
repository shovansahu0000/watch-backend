import Joi from 'joi';

export const checkoutSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      sku: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required()
});
