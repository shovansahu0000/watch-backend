import couponService from './coupon.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class CouponController {
  getCoupons = asyncHandler(async (req, res) => {
    const result = await couponService.getCoupons();
    return ApiResponse.success(res, result, 'Coupons retrieved successfully');
  });

  createCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.createCoupon(req.body);
    return ApiResponse.success(res, { coupon }, 'Coupon created successfully', 201);
  });

  updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coupon = await couponService.updateCoupon(id, req.body);
    return ApiResponse.success(res, { coupon }, 'Coupon updated successfully');
  });

  deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await couponService.deleteCoupon(id);
    return ApiResponse.success(res, null, 'Coupon deleted successfully');
  });

  applyCoupon = asyncHandler(async (req, res) => {
    const { code, items, subtotal } = req.body;
    const user = req.user;
    const result = await couponService.applyCoupon(user, code, items, subtotal);
    return ApiResponse.success(res, result, 'Coupon applied successfully');
  });

  removeCoupon = asyncHandler(async (req, res) => {
    const { items, subtotal } = req.body;
    const result = await couponService.removeCoupon(items, subtotal);
    return ApiResponse.success(res, result, 'Coupon removed successfully');
  });
}

export default new CouponController();
