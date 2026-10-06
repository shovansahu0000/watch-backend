import userService from './user.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class UserController {
  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user._id);
    return ApiResponse.success(res, { user }, 'Profile retrieved successfully');
  });

  addAddress = asyncHandler(async (req, res) => {
    const user = await userService.addAddress(req.user._id, req.body);
    return ApiResponse.success(res, { user }, 'Address added successfully');
  });
}

export default new UserController();
