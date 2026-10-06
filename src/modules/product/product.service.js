import { getReadProduct, getWriteProduct } from './product.model.js';
import redisClient from '../../config/redis.config.js';
import { REDIS_KEYS } from '../../config/constants.js';
import CustomError from '../../utils/customError.util.js';

class ProductService {
  async getProducts(query) {
    const { category, brand, minPrice, maxPrice, isBestSeller, page = 1, limit = 10 } = query;
    
    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = { $in: brand.split(',') };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }
    if (isBestSeller !== undefined) filter.isBestSeller = isBestSeller;

    const skip = (page - 1) * limit;
    
    const ProductRead = getReadProduct();
    const [products, total] = await Promise.all([
      ProductRead.find(filter).skip(skip).limit(limit).lean(),
      ProductRead.countDocuments(filter)
    ]);

    return {
      products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
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
      throw new CustomError('Product not found', 404);
    }
    
    // Save to Redis with 1-hour TTL
    await redisClient.setex(redisKey, 3600, JSON.stringify(product));
    
    return product;
  }

  async createProduct(data) {
    const ProductWrite = getWriteProduct();
    const existing = await ProductWrite.findOne({ sku: data.sku });
    if (existing) {
      throw new CustomError('Product with this SKU already exists', 400);
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
