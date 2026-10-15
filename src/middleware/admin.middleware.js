import { ROLES } from "../config/constants.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import CustomError from "../utils/customError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { getReadUser } from "../modules/auth/auth.model.js";

export const restrictToAdmin = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new CustomError(
        "You are not logged in. Please log in to get access.",
        401,
      ),
    );
  }

  const decoded = jwt.verify(token, env.JWT_ADMIN_SECRET);

  const User = getReadUser();
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new CustomError("Admin does not exist.", 401));
  }

  if (currentUser.role !== ROLES.ADMIN) {
    return next(
      new CustomError("You do not have permission to perform this action", 403),
    );
  }

  req.user = currentUser;
  next();
});
