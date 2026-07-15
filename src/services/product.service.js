import ProductModel from '../models/product.model.js';
import FactoryInventoryModel from '../models/factoryInventory.model.js';
import RetailInventoryModel from '../models/retailInventory.model.js';
import { generateUniqueBarcode } from '../utils/barcode.js';

class ProductService {
  static async addProduct(productData) {
    const { productName, brand, category, size, color, mrp, gst, discount, image, status } = productData;

    // 1. Resolve Brand and Category names to database IDs
    const categoryId = await ProductModel.getOrCreateCategory(category);
    const brandId = await ProductModel.getOrCreateBrand(brand);

    // 2. Check for duplicate products
    const duplicate = await ProductModel.findDuplicate({ productName, brandId, size, color });
    if (duplicate) {
      throw new Error('A duplicate product with the same name, brand, size, and color already exists.');
    }

    // 3. Generate a unique EAN-13 barcode
    let barcode;
    let isUnique = false;
    while (!isUnique) {
      barcode = generateUniqueBarcode();
      const existing = await ProductModel.findByBarcode(barcode);
      if (!existing) {
        isUnique = true;
      }
    }

    // 4. Create the product
    const product = await ProductModel.create({
      barcode,
      productName,
      categoryId,
      brandId,
      size,
      color,
      mrp,
      gst,
      discount,
      image,
      status
    });
    
    // 5. Automatically create empty inventory records
    await FactoryInventoryModel.create({ productId: product.productId, quantity: 0 });
    await RetailInventoryModel.create({ productId: product.productId, quantity: 0, minimumStock: 5 });

    return product;
  }

  static async updateProduct(id, updateData) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new Error('Product not found.');
    }

    const fieldsToUpdate = { ...updateData };

    // Resolve Brand and Category names to database IDs if provided
    if (updateData.category) {
      fieldsToUpdate.categoryId = await ProductModel.getOrCreateCategory(updateData.category);
      delete fieldsToUpdate.category;
    }
    if (updateData.brand) {
      fieldsToUpdate.brandId = await ProductModel.getOrCreateBrand(updateData.brand);
      delete fieldsToUpdate.brand;
    }

    // Check for duplicate products if identifying details are updated
    if (fieldsToUpdate.productName || fieldsToUpdate.brandId || fieldsToUpdate.size || fieldsToUpdate.color) {
      const productName = fieldsToUpdate.productName || product.productName;
      const brandId = fieldsToUpdate.brandId || product.brandId;
      const size = fieldsToUpdate.size || product.size;
      const color = fieldsToUpdate.color || product.color;

      const duplicate = await ProductModel.findDuplicate({ productName, brandId, size, color });
      if (duplicate && duplicate.productId !== Number(id)) {
        throw new Error('Another product with the same name, brand, size, and color already exists.');
      }
    }

    if (fieldsToUpdate.barcode && fieldsToUpdate.barcode !== product.barcode) {
      const existing = await ProductModel.findByBarcode(fieldsToUpdate.barcode);
      if (existing) {
        throw new Error('Barcode already exists.');
      }
    }

    return await ProductModel.update(id, fieldsToUpdate);
  }

  static async getProductById(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new Error('Product not found.');
    }
    return product;
  }

  static async getProducts(params) {
    const products = await ProductModel.queryProducts(params);
    const totalCount = await ProductModel.countProducts(params);
    return {
      products,
      pagination: {
        total: totalCount,
        page: Number(params.page || 1),
        limit: Number(params.limit || 20),
        pages: Math.ceil(totalCount / Number(params.limit || 20))
      }
    };
  }

  static async deleteProduct(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new Error('Product not found.');
    }
    // Perform a soft deactivation to preserve relational integrity with sales and inventory
    return await ProductModel.update(id, { status: 'Inactive' });
  }
}

export default ProductService;
