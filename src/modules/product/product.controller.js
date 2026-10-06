import productService from './product.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class ProductController {
  getProducts = asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query);
    return ApiResponse.success(res, result, 'Products retrieved successfully');
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
}

export default new ProductController();
