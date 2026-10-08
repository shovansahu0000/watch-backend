import authService from './auth.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class AuthController {
  // sendOtp = asyncHandler(async (req, res) => {
  //   const { phone } = req.body;
  //   const result = await authService.sendOtp(phone);
  //   return ApiResponse.success(res, result, 'OTP sent successfully');
  // });

  // verifyOtp = asyncHandler(async (req, res) => {
  //   const { phone, otp } = req.body;
  //   const { user, accessToken, refreshToken } = await authService.verifyOtp(phone, otp);

  //   const refreshCookieOptions = {
  //     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === 'production',
  //     sameSite: 'strict'
  //   };

  //   const accessCookieOptions = {
  //     expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  //     secure: process.env.NODE_ENV === 'production',
  //     sameSite: 'strict'
  //   };

  //   res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  //   res.cookie('accessToken', accessToken, accessCookieOptions);

  //   return ApiResponse.success(res, { user, accessToken }, 'Logged in successfully');
  // });

  googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const { user, accessToken, refreshToken } = await authService.googleLogin(token);

    const refreshCookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    const accessCookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.cookie('accessToken', accessToken, accessCookieOptions);

    return ApiResponse.success(res, { user, accessToken }, 'Logged in with Google successfully');
  });

  logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user._id);
    
    res.cookie('refreshToken', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.cookie('accessToken', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return ApiResponse.success(res, null, 'Logged out successfully');
  });



  refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    const { accessToken } = await authService.refreshAccessToken(token);

    res.cookie('accessToken', accessToken, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return ApiResponse.success(res, { accessToken }, 'Access token refreshed successfully');
  });
}

export default new AuthController();
