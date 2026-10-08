import { getReadProduct, getWriteProduct } from "./product.model.js";
import redisClient from "../../config/redis.config.js";
import { REDIS_KEYS } from "../../config/constants.js";
import CustomError from "../../utils/customError.util.js";

class ProductService {
  async getProducts() {
    const redisKey = REDIS_KEYS.ALL_PRODUCTS;
    const cachedProducts = await redisClient.get(redisKey);
    if (cachedProducts) {
      return { products: JSON.parse(cachedProducts) };
    }

    const ProductRead = getReadProduct();
    const products = await ProductRead.find({}).lean();

    await redisClient.setex(redisKey, 86400, JSON.stringify(products));
    return { products };
  }

  async getFeaturedProducts() {
    const redisKey = REDIS_KEYS.FEATURED_PRODUCTS;
    const cachedProducts = await redisClient.get(redisKey);
    if (cachedProducts) {
      return { products: JSON.parse(cachedProducts) };
    }

    const ProductRead = getReadProduct();
    const products = await ProductRead.find({ bestSeller: true })
      .limit(8)
      .lean();

    await redisClient.setex(redisKey, 86400, JSON.stringify(products));

    return { products };
  }

  async getProductBySku(sku) {
    const redisKey = REDIS_KEYS.PRODUCT(sku);

    // Cache-aside
    const cachedProduct = await redisClient.get(redisKey);
    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }

    const ProductRead = getReadProduct();
    const product = await ProductRead.findOne({ sku }).lean();

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    // Save to Redis with 1-hour TTL
    await redisClient.setex(redisKey, 3600, JSON.stringify(product));

    return product;
  }

  async createProduct(data) {
    const ProductWrite = getWriteProduct();
    const existing = await ProductWrite.findOne({ sku: data.sku });
    if (existing) {
      throw new CustomError("Product with this SKU already exists", 400);
    }

    const product = await ProductWrite.create(data);

    // Invalidate caches if needed (e.g., featured products)
    if (product.isBestSeller) {
      await redisClient.del(REDIS_KEYS.FEATURED_PRODUCTS);
    }

    return product;
  }
}

export default new ProductService();
