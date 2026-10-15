import { getReadCoupon, getWriteCoupon } from "./coupon.model.js";
import { getReadProduct } from "../product/product.model.js";
import redisClient from "../../config/redis.config.js";
import { REDIS_KEYS } from "../../config/constants.js";
import CustomError from "../../utils/customError.util.js";

class CouponService {
  async _invalidateCouponsCache() {
    await redisClient.del(REDIS_KEYS.ALL_COUPONS);
  }

  async calculateVerifiedSubtotal(items) {
    if (!items || !items.length) {
      return 0;
    }

    const ProductRead = getReadProduct();
    let subtotal = 0;
    const missingSkus = [];
    const itemMap = new Map();

    for (const item of items) {
      itemMap.set(item.sku, item.quantity);
    }

    const skus = Array.from(itemMap.keys());
    try {
      const redisPipeline = redisClient.pipeline();
      for (const sku of skus) {
        redisPipeline.get(REDIS_KEYS.PRODUCT(sku));
      }
      const results = await redisPipeline.exec();

      for (let i = 0; i < skus.length; i++) {
        const sku = skus[i];
        const [err, cachedProduct] = results[i] || [];
        if (!err && cachedProduct) {
          const prod = JSON.parse(cachedProduct);
          subtotal += prod.price * (itemMap.get(sku) || 1);
        } else {
          missingSkus.push(sku);
        }
      }
    } catch (e) {
      missingSkus.push(...skus);
    }

    if (missingSkus.length > 0) {
      const dbProducts = await ProductRead.find({
        sku: { $in: missingSkus },
      }).lean();
      for (const prod of dbProducts) {
        subtotal += prod.price * (itemMap.get(prod.sku) || 1);
        await redisClient.setex(
          REDIS_KEYS.PRODUCT(prod.sku),
          3600,
          JSON.stringify(prod),
        );
      }
    }

    return subtotal;
  }

  async getCoupons() {
    const redisKey = REDIS_KEYS.ALL_COUPONS;
    const cached = await redisClient.get(redisKey);
    if (cached) {
      return { coupons: JSON.parse(cached) };
    }

    const CouponRead = getReadCoupon();
    const coupons = await CouponRead.find({}).sort({ createdAt: -1 }).lean();
    await redisClient.setex(redisKey, 86400, JSON.stringify(coupons));
    return { coupons };
  }

  async getCouponByCode(code) {
    if (!code) return null;
    const normalizedCode = code.trim().toUpperCase();
    const redisKey = REDIS_KEYS.COUPON(normalizedCode);
    const cached = await redisClient.get(redisKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const CouponRead = getReadCoupon();
    const coupon = await CouponRead.findOne({ code: normalizedCode }).lean();
    await redisClient.setex(redisKey, 3600, JSON.stringify(coupon));

    return coupon;
  }

  async createCoupon(data) {
    const CouponWrite = getWriteCoupon();
    const normalizedCode = data.code.trim().toUpperCase();

    const existing = await CouponWrite.findOne({ code: normalizedCode });
    if (existing) {
      throw new CustomError(
        `Coupon with code "${normalizedCode}" already exists`,
        400,
      );
    }

    const coupon = await CouponWrite.create({
      ...data,
      code: normalizedCode,
    });

    await this._invalidateCouponsCache();
    await redisClient.setex(
      REDIS_KEYS.COUPON(normalizedCode),
      3600,
      JSON.stringify(coupon.toObject()),
    );

    return coupon;
  }

  async updateCoupon(id, data) {
    const CouponWrite = getWriteCoupon();

    if (data.code) {
      const normalizedCode = data.code.trim().toUpperCase();
      const existing = await CouponWrite.findOne({
        code: normalizedCode,
        _id: { $ne: id },
      });
      if (existing) {
        throw new CustomError(
          `Coupon with code "${normalizedCode}" already exists`,
          400,
        );
      }
      data.code = normalizedCode;
    }

    const coupon = await CouponWrite.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      throw new CustomError("Coupon not found", 404);
    }

    await this._invalidateCouponsCache();
    await redisClient.setex(
      REDIS_KEYS.COUPON(coupon.code),
      3600,
      JSON.stringify(coupon.toObject()),
    );

    return coupon;
  }

  async deleteCoupon(id) {
    const CouponWrite = getWriteCoupon();
    const coupon = await CouponWrite.findByIdAndDelete(id);
    if (!coupon) {
      throw new CustomError("Coupon not found", 404);
    }

    await this._invalidateCouponsCache();
    await redisClient.del(REDIS_KEYS.COUPON(coupon.code));

    return coupon;
  }

  async applyCoupon(user, code, items, explicitSubtotal) {
    let subtotal = 0;

    if (items && items.length > 0) {
      subtotal = await this.calculateVerifiedSubtotal(items);
    } else if (explicitSubtotal !== undefined && explicitSubtotal !== null) {
      subtotal = Number(explicitSubtotal);
    }

    const coupon = await this.getCouponByCode(code);
    if (!coupon) {
      throw new CustomError("Invalid coupon code", 404);
    }

    if (!coupon.isActive) {
      throw new CustomError("This coupon is currently inactive", 400);
    }

    const now = new Date();
    const expiry = new Date(coupon.expiresAt);
    if (expiry <= now) {
      throw new CustomError("This coupon has expired", 400);
    }

    const usedCoupons = user.usedCoupons || [];
    const isAlreadyUsed = usedCoupons.some(
      (cId) => cId.toString() === coupon._id.toString(),
    );

    if (isAlreadyUsed) {
      throw new CustomError("You have already used this coupon", 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);
    const finalPrice = Math.max(0, subtotal - discountAmount);

    return {
      subtotal,
      discountAmount,
      finalPrice,
      appliedCouponCode: coupon.code,
    };
  }

  async removeCoupon(items, explicitSubtotal) {
    let subtotal = 0;

    if (items && items.length > 0) {
      subtotal = await this.calculateVerifiedSubtotal(items);
    } else if (explicitSubtotal !== undefined && explicitSubtotal !== null) {
      subtotal = Number(explicitSubtotal);
    }

    return {
      subtotal,
      discountAmount: 0,
      finalPrice: subtotal,
      appliedCouponCode: null,
    };
  }
}

export default new CouponService();
