import CategoryModel from '../models/category.model.js';
import { sendSuccess } from '../utils/response.js';

export const createCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.create(req.body.categoryName);
    return sendSuccess(res, 'Category created successfully.', category, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.findAll();
    return sendSuccess(res, 'Categories retrieved successfully.', categories);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.update(req.params.id, req.body.categoryName);
    return sendSuccess(res, 'Category updated successfully.', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.delete(req.params.id);
    return sendSuccess(res, 'Category deleted successfully.', category);
  } catch (error) {
    next(error);
  }
};
