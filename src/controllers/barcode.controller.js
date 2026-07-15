import ProductModel from '../models/product.model.js';
import { generateUniqueBarcode } from '../utils/barcode.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const generateBarcode = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return sendError(res, 'productId is required.', null, 400);
    }
    
    // Verify product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return sendError(res, 'Product not found.', null, 404);
    }
    
    // Generate unique barcode
    let barcode;
    let isUnique = false;
    while (!isUnique) {
      barcode = generateUniqueBarcode();
      const existing = await ProductModel.findByBarcode(barcode);
      if (!existing) {
        isUnique = true;
      }
    }
    
    // Save barcode with product
    await ProductModel.update(productId, { barcode });
    
    return sendSuccess(res, 'Barcode generated successfully.', { barcode });
  } catch (error) {
    next(error);
  }
};

export const getBarcodeDetails = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    if (!barcode) {
      return sendError(res, 'Barcode is required.', null, 400);
    }
    
    const product = await ProductModel.findByBarcode(barcode);
    if (!product) {
      return sendError(res, 'Barcode not found.', null, 404);
    }
    
    return sendSuccess(res, 'Barcode details retrieved successfully.', {
      barcode: product.barcode,
      productName: product.productName,
      brand: product.brandName || '',
      category: product.categoryName || '',
      size: product.size,
      price: product.mrp
    });
  } catch (error) {
    next(error);
  }
};

export const validateBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return sendSuccess(res, 'Barcode not found.', { valid: false });
    }
    
    const product = await ProductModel.findByBarcode(barcode);
    if (!product) {
      return sendSuccess(res, 'Barcode not found.', { valid: false });
    }
    
    return sendSuccess(res, 'Barcode found.', { valid: true });
  } catch (error) {
    next(error);
  }
};
