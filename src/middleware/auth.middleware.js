import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import CustomError from '../utils/customError.util.js';
import asyncHandler from '../utils/asyncHandler.util.js';
import { getReadUser } from '../modules/auth/auth.model.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new CustomError('You are not logged in. Please log in to get access.', 401));
  }

  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  
  const User = getReadUser();
  const currentUser = await User.findById(decoded.id);
  
  if (!currentUser) {
    return next(new CustomError('The user belonging to this token does no longer exist.', 401));
  }

  req.user = currentUser;
  next();
});
