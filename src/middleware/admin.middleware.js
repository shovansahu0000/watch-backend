import CustomError from '../utils/customError.util.js';
import { ROLES } from '../config/constants.js';

export const restrictToAdmin = (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    return next(new CustomError('You do not have permission to perform this action', 403));
  }
  next();
};
