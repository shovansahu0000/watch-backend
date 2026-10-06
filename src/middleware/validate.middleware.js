import CustomError from '../utils/customError.util.js';

export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(new CustomError(errorMessage, 400));
    }
    next();
  };
};
