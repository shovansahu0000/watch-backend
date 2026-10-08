import userService from './user.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class UserController {
  getMe = asyncHandler(async (req, res) => {
    const user = await userService.getMe(req.user._id);
    return ApiResponse.success(res, { user }, 'User details retrieved successfully');
  });

  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user._id, req.body);
    return ApiResponse.success(res, { user }, 'Profile updated successfully');
  });
}

export default new UserController();
