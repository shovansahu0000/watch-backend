import { getReadBrand, getWriteBrand } from "./brand.model.js";
import redisClient from "../../config/redis.config.js";
import { REDIS_KEYS } from "../../config/constants.js";
import CustomError from "../../utils/customError.util.js";

class BrandService {
  async _updateBrandsCache() {
    const BrandWrite = getWriteBrand();
    const brands = await BrandWrite.find({}).lean();
    await redisClient.setex(REDIS_KEYS.ALL_BRANDS, 86400, JSON.stringify(brands));
  }

  async getBrands() {
    const redisKey = REDIS_KEYS.ALL_BRANDS;
    const cachedBrands = await redisClient.get(redisKey);
    if (cachedBrands) {
      return { brands: JSON.parse(cachedBrands) };
    }

    const BrandRead = getReadBrand();
    const brands = await BrandRead.find({}).lean();

    await redisClient.setex(redisKey, 86400, JSON.stringify(brands));
    return { brands };
  }

  async createBrand(data) {
    const BrandWrite = getWriteBrand();
    
    const existing = await BrandWrite.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
    if (existing) {
      throw new CustomError("Brand with this name already exists", 400);
    }

    const brand = await BrandWrite.create(data);
    await this._updateBrandsCache();
    return brand;
  }

  async updateBrand(id, data) {
    const BrandWrite = getWriteBrand();
    
    if (data.name) {
      const existing = await BrandWrite.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') }, _id: { $ne: id } });
      if (existing) {
        throw new CustomError("Brand with this name already exists", 400);
      }
    }

    const brand = await BrandWrite.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!brand) {
        throw new CustomError("Brand not found", 404);
    }

    await this._updateBrandsCache();
    return brand;
  }

  async deleteBrand(id) {
    const BrandWrite = getWriteBrand();
    
    const brand = await BrandWrite.findByIdAndDelete(id);
    if (!brand) {
      throw new CustomError("Brand not found", 404);
    }

    await this._updateBrandsCache();
    return brand;
  }
}

export default new BrandService();
