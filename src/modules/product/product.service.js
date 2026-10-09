import { getReadProduct, getWriteProduct } from "./product.model.js";
import { getReadBrand } from "../brand/brand.model.js";
import redisClient from "../../config/redis.config.js";
import { REDIS_KEYS } from "../../config/constants.js";
import CustomError from "../../utils/customError.util.js";

class ProductService {
  async _updateProductsCache() {
    const ProductWrite = getWriteProduct();
    const products = await ProductWrite.find({}).lean();
    await redisClient.setex(REDIS_KEYS.ALL_PRODUCTS, 86400, JSON.stringify(products));
  }

  async _updateFeaturedProductsCache() {
    const ProductWrite = getWriteProduct();
    const products = await ProductWrite.find({ bestSeller: true }).limit(8).lean();
    await redisClient.setex(REDIS_KEYS.FEATURED_PRODUCTS, 86400, JSON.stringify(products));
  }

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

    const cachedProduct = await redisClient.get(redisKey);
    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }

    const ProductRead = getReadProduct();
    const product = await ProductRead.findOne({ sku }).lean();

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    await redisClient.setex(redisKey, 3600, JSON.stringify(product));

    return product;
  }

  async createProduct(data) {
    const BrandRead = getReadBrand();
    const brandExists = await BrandRead.findOne({ name: { $regex: new RegExp(`^${data.brand}$`, 'i') } });
    if (!brandExists) {
      throw new CustomError("Brand does not exist. Please create the brand first.", 400);
    }

    const ProductWrite = getWriteProduct();
    const existing = await ProductWrite.findOne({ sku: data.sku });
    if (existing) {
      throw new CustomError("Product with this SKU already exists", 400);
    }

    const product = await ProductWrite.create(data);

    await this._updateProductsCache();
    if (product.bestSeller) {
      await this._updateFeaturedProductsCache();
    }

    return product;
  }

  async updateProduct(sku, data) {
    if (data.brand) {
      const BrandRead = getReadBrand();
      const brandExists = await BrandRead.findOne({ name: { $regex: new RegExp(`^${data.brand}$`, 'i') } });
      if (!brandExists) {
        throw new CustomError("Brand does not exist. Please create the brand first.", 400);
      }
    }

    const ProductWrite = getWriteProduct();
    const product = await ProductWrite.findOneAndUpdate({ sku }, data, { new: true, runValidators: true });
    
    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    await redisClient.setex(REDIS_KEYS.PRODUCT(sku), 3600, JSON.stringify(product));
    await this._updateProductsCache();
    if (product.bestSeller || data.bestSeller !== undefined) {
      await this._updateFeaturedProductsCache();
    }

    return product;
  }
}

export default new ProductService();
