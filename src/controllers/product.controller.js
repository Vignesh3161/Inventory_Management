import ProductService from '../services/product.service.js';
import ProductModel from '../models/product.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const addProduct = async (req, res, next) => {
  try {
    const product = await ProductService.addProduct(req.body);
    return sendSuccess(res, 'Product created successfully.', product, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, 'Product updated successfully.', product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await ProductService.deleteProduct(req.params.id);
    return sendSuccess(res, 'Product deleted successfully.', product);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    return sendSuccess(res, 'Product retrieved successfully.', product);
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      brand,
      category,
      size,
      color,
      minPrice,
      maxPrice,
      status,
      search
    } = req.query;

    const result = await ProductService.getProducts({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder,
      brand,
      category,
      size,
      color,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      status,
      search
    });

    return sendSuccess(res, 'Products retrieved successfully.', result);
  } catch (error) {
    next(error);
  }
};

export const getProductByBarcode = async (req, res, next) => {
  try {
    const product = await ProductModel.findByBarcode(req.params.barcode);
    if (!product) {
      return sendError(res, 'Product barcode not found.', null, 404);
    }
    
    const responsePayload = {
      productId: product.productId,
      productName: product.productName,
      price: product.mrp,
      gst: product.gst,
      discount: product.discount,
      stockStatus: product.status
    };

    return sendSuccess(res, 'Product found by barcode.', {
      ...product,
      ...responsePayload
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const searchVal = req.query.search || req.query.q || req.query.Search;
    const result = await ProductService.getProducts({ search: searchVal });
    return sendSuccess(res, 'Search completed successfully.', result);
  } catch (error) {
    next(error);
  }
};

export const filterProducts = async (req, res, next) => {
  try {
    const { brand, category, size, color, minPrice, maxPrice, status } = req.query;
    const result = await ProductService.getProducts({
      brand,
      category,
      size,
      color,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      status
    });
    return sendSuccess(res, 'Filtering completed successfully.', result);
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('Please upload an image file.');
    }
    const productId = req.params.productId || req.params.id;
    if (!productId) {
      throw new Error('Product ID is required.');
    }
    const imageUrl = req.file.path;
    const updatedProduct = await ProductService.updateProduct(productId, { image: imageUrl });
    return sendSuccess(res, 'Image uploaded successfully.', updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const updateProductStockStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      throw new Error('Status field is required.');
    }
    const product = await ProductService.updateProduct(req.params.id, { status });
    return sendSuccess(res, 'Product stock status updated successfully.', product);
  } catch (error) {
    next(error);
  }
};
