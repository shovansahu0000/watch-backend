import authService from './auth.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class AuthController {
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
      sameSite: 'strict',
      httpOnly: true
    });

    return ApiResponse.success(res, { accessToken }, 'Access token refreshed successfully');
  });

  adminSendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    await authService.adminSendOtp(email);
    return ApiResponse.success(res, null, 'OTP sent successfully to email');
  });

  adminVerifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const { user, accessToken } = await authService.adminVerifyOtp(email, otp);

    const accessCookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: true
    };

    res.cookie('accessToken', accessToken, accessCookieOptions);

    return ApiResponse.success(res, { user, accessToken }, 'Admin logged in successfully');
  });

  adminLogout = asyncHandler(async (req, res) => {
    res.cookie('accessToken', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: true
    });
    
    return ApiResponse.success(res, null, 'Admin logged out successfully');
  });
}

export default new AuthController();
