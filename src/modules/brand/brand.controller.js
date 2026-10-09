import brandService from './brand.service.js';
import ApiResponse from '../../utils/apiResponse.util.js';
import asyncHandler from '../../utils/asyncHandler.util.js';

class BrandController {
  getBrands = asyncHandler(async (req, res) => {
    const result = await brandService.getBrands();
    return ApiResponse.success(res, result, 'Brands retrieved successfully');
  });

  createBrand = asyncHandler(async (req, res) => {
    const brand = await brandService.createBrand(req.body);
    return ApiResponse.success(res, { brand }, 'Brand created successfully', 201);
  });

  updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const brand = await brandService.updateBrand(id, req.body);
    return ApiResponse.success(res, { brand }, 'Brand updated successfully');
  });

  deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await brandService.deleteBrand(id);
    return ApiResponse.success(res, null, 'Brand deleted successfully');
  });
}

export default new BrandController();
