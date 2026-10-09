export const REDIS_KEYS = {
  OTP: (phone) => `otp:${phone}`,
  PRODUCT: (sku) => `product:${sku}`,
  FEATURED_PRODUCTS: "products:featured",
  USER_CART: (userId) => `cart:${userId}`,
  ALL_PRODUCTS: "products:all",
};

export const ORDER_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const TRACKING_STATUS = {
  PENDING: "Pending",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  RETURNED: "Returned",
};

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

export const CATEGORIES = {
  MALE: "Male",
  FEMALE: "Female",
};
