import BrandModel from '../models/brand.model.js';
import { sendSuccess } from '../utils/response.js';

export const createBrand = async (req, res, next) => {
  try {
    const brand = await BrandModel.create(req.body.brandName);
    return sendSuccess(res, 'Brand created successfully.', brand, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllBrands = async (req, res, next) => {
  try {
    const brands = await BrandModel.findAll();
    return sendSuccess(res, 'Brands retrieved successfully.', brands);
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const brand = await BrandModel.update(req.params.id, req.body.brandName);
    return sendSuccess(res, 'Brand updated successfully.', brand);
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    const brand = await BrandModel.delete(req.params.id);
    return sendSuccess(res, 'Brand deleted successfully.', brand);
  } catch (error) {
    next(error);
  }
};
