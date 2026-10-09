import productService from './product.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class ProductController {
  getProducts = asyncHandler(async (req, res) => {
    const result = await productService.getProducts();
    return ApiResponse.success(res, result, 'Products retrieved successfully');
  });

  getFeaturedProducts = asyncHandler(async (req, res) => {
    const result = await productService.getFeaturedProducts();
    return ApiResponse.success(res, result, 'Featured products retrieved successfully');
  });

  getProductBySku = asyncHandler(async (req, res) => {
    const { sku } = req.params;
    const product = await productService.getProductBySku(sku);
    return ApiResponse.success(res, { product }, 'Product retrieved successfully');
  });

  createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);
    return ApiResponse.success(res, { product }, 'Product created successfully', 201);
  });

  updateProduct = asyncHandler(async (req, res) => {
    const { sku } = req.params;
    const product = await productService.updateProduct(sku, req.body);
    return ApiResponse.success(res, { product }, 'Product updated successfully');
  });
}

export default new ProductController();
