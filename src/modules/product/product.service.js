import { getReadProduct, getWriteProduct } from "./product.model.js";
import { getReadBrand } from "../brand/brand.model.js";
import redisClient from "../../config/redis.config.js";
import { REDIS_KEYS } from "../../config/constants.js";
import CustomError from "../../utils/customError.util.js";
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from "../../utils/cloudinary.util.js";

class ProductService {
  async _updateProductsCache() {
    const ProductWrite = getWriteProduct();
    const products = await ProductWrite.find({}).lean();
    await redisClient.setex(REDIS_KEYS.ALL_PRODUCTS, 86400, JSON.stringify(products));
  }

  async _updateFeaturedProductsCache() {
    const ProductWrite = getWriteProduct();
    const products = await ProductWrite.find({ bestSeller: true, stockQuantity: { $gt: 0 } }).limit(8).lean();
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
    const products = await ProductRead.find({ bestSeller: true, stockQuantity: { $gt: 0 } })
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

  async createProduct(data, files) {
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

    const uploadedCloudinaryPublicIds = [];

    const hasAllUploadedFiles = files?.front?.[0] && files?.left?.[0] && files?.right?.[0];
    const hasExistingImages = data.images?.front && data.images?.left && data.images?.right;

    if (!hasAllUploadedFiles && !hasExistingImages) {
      throw new CustomError("All 3 watch images (front, left, and right views) are required.", 400);
    }

    if (hasAllUploadedFiles) {
      try {
        const frontUpload = await uploadOnCloudinary(files.front[0].path, 'watches');
        uploadedCloudinaryPublicIds.push(frontUpload.publicId);

        const leftUpload = await uploadOnCloudinary(files.left[0].path, 'watches');
        uploadedCloudinaryPublicIds.push(leftUpload.publicId);

        const rightUpload = await uploadOnCloudinary(files.right[0].path, 'watches');
        uploadedCloudinaryPublicIds.push(rightUpload.publicId);

        data.images = {
          front: frontUpload.url,
          left: leftUpload.url,
          right: rightUpload.url,
        };

        data.imagePublicIds = {
          front: frontUpload.publicId,
          left: leftUpload.publicId,
          right: rightUpload.publicId,
        };

        data.image = frontUpload.url;
      } catch (err) {
        for (const publicId of uploadedCloudinaryPublicIds) {
          await deleteFromCloudinary(publicId).catch(() => {});
        }
        throw err;
      }
    }

    let product;
    try {
      product = await ProductWrite.create(data);
    } catch (dbErr) {
      for (const publicId of uploadedCloudinaryPublicIds) {
        await deleteFromCloudinary(publicId).catch(() => {});
      }
      throw dbErr;
    }

    await this._updateProductsCache();
    if (product.bestSeller) {
      await this._updateFeaturedProductsCache();
    }

    return product;
  }

  async updateProduct(sku, data, files) {
    if (data.brand) {
      const BrandRead = getReadBrand();
      const brandExists = await BrandRead.findOne({ name: { $regex: new RegExp(`^${data.brand}$`, 'i') } });
      if (!brandExists) {
        throw new CustomError("Brand does not exist. Please create the brand first.", 400);
      }
    }

    const ProductWrite = getWriteProduct();
    const existingProduct = await ProductWrite.findOne({ sku });
    if (!existingProduct) {
      throw new CustomError("Product not found", 404);
    }

    const newlyUploadedPublicIds = [];
    const oldCloudinaryToDelete = [];
    const updatedImages = {
      ...(existingProduct.images?.toObject?.() || existingProduct.images || {})
    };
    const updatedPublicIds = {
      ...(existingProduct.imagePublicIds?.toObject?.() || existingProduct.imagePublicIds || {})
    };

    const views = ['front', 'left', 'right'];
    for (const view of views) {
      if (files?.[view]?.[0]) {
        try {
          const uploadRes = await uploadOnCloudinary(files[view][0].path, 'watches');
          newlyUploadedPublicIds.push(uploadRes.publicId);

          const oldId = updatedPublicIds[view] || extractPublicId(updatedImages[view]);
          if (oldId) {
            oldCloudinaryToDelete.push(oldId);
          }

          updatedImages[view] = uploadRes.url;
          updatedPublicIds[view] = uploadRes.publicId;
        } catch (err) {
          for (const publicId of newlyUploadedPublicIds) {
            await deleteFromCloudinary(publicId).catch(() => {});
          }
          throw err;
        }
      }
    }

    if (newlyUploadedPublicIds.length > 0) {
      data.images = updatedImages;
      data.imagePublicIds = updatedPublicIds;
      if (updatedImages.front) {
        data.image = updatedImages.front;
      }
    }

    const unsettableFields = ['caseSize', 'movement', 'waterResistance', 'description', 'mrp'];
    const setOps = {};
    const unsetOps = {};

    for (const [key, val] of Object.entries(data)) {
      if ((val === '' || val === null) && unsettableFields.includes(key)) {
        unsetOps[key] = 1;
      } else if (val !== '' && val !== null) {
        setOps[key] = val;
      }
    }

    const updateOps = {};
    if (Object.keys(setOps).length > 0) updateOps.$set = setOps;
    if (Object.keys(unsetOps).length > 0) updateOps.$unset = unsetOps;

    let product;
    try {
      product = await ProductWrite.findOneAndUpdate({ sku }, updateOps, { new: true, runValidators: true });
    } catch (dbErr) {
      for (const publicId of newlyUploadedPublicIds) {
        await deleteFromCloudinary(publicId).catch(() => {});
      }
      throw dbErr;
    }

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    for (const oldId of oldCloudinaryToDelete) {
      await deleteFromCloudinary(oldId).catch(() => {});
    }

    await redisClient.setex(REDIS_KEYS.PRODUCT(sku), 3600, JSON.stringify(product));
    await this._updateProductsCache();
    if (product.bestSeller || data.bestSeller !== undefined) {
      await this._updateFeaturedProductsCache();
    }

    return product;
  }

  async deleteProduct(sku) {
    const ProductWrite = getWriteProduct();
    const product = await ProductWrite.findOneAndDelete({ sku });
    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    const views = ['front', 'left', 'right'];
    for (const view of views) {
      const publicId = product.imagePublicIds?.[view] || extractPublicId(product.images?.[view]);
      if (publicId) {
        await deleteFromCloudinary(publicId).catch(() => {});
      }
    }

    await redisClient.del(REDIS_KEYS.PRODUCT(sku));
    await this._updateProductsCache();
    await this._updateFeaturedProductsCache();

    return { sku, message: "Product and associated images deleted successfully" };
  }
}

export default new ProductService();
