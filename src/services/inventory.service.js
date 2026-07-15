import FactoryInventoryModel from '../models/factoryInventory.model.js';
import RetailInventoryModel from '../models/retailInventory.model.js';
import StockTransferModel from '../models/stockTransfer.model.js';
import FactoryStockMovementModel from '../models/factoryStockMovement.model.js';
import RetailStockMovementModel from '../models/retailStockMovement.model.js';
import ProductModel from '../models/product.model.js';

class InventoryService {
  // --- Factory Inventory Operations ---

  static async addProducedStock(productId, quantity) {
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    let inventory = await FactoryInventoryModel.findByProductId(productId);
    if (!inventory) {
      inventory = await FactoryInventoryModel.create({ productId, quantity });
    } else {
      inventory = await FactoryInventoryModel.updateQuantity(productId, quantity);
    }

    await FactoryStockMovementModel.create({
      productId,
      movementType: 'Production',
      quantity,
      reason: 'Produced stock addition'
    });

    return inventory;
  }

  static async updateFactoryStock(productId, quantity) {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const currentInventory = await FactoryInventoryModel.findByProductId(productId);
    const oldQty = currentInventory ? currentInventory.quantity : 0;
    const diff = quantity - oldQty;

    let inventory = await FactoryInventoryModel.setQuantity(productId, quantity);

    if (diff !== 0) {
      await FactoryStockMovementModel.create({
        productId,
        movementType: 'Adjustment',
        quantity: diff,
        reason: 'Manual Correction'
      });
    }

    return inventory;
  }

  static async removeFactoryStock(productId, quantity, reason = 'Damage/Disposal') {
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const currentInventory = await FactoryInventoryModel.findByProductId(productId);
    const available = currentInventory ? currentInventory.quantity : 0;
    if (quantity > available) {
      throw new Error(`Insufficient Factory Stock. Available: ${available}`);
    }

    const inventory = await FactoryInventoryModel.updateQuantity(productId, -quantity);

    await FactoryStockMovementModel.create({
      productId,
      movementType: 'Damage',
      quantity: -quantity,
      reason
    });

    return inventory;
  }

  static async adjustFactoryStock(productId, actualQuantity, reason = 'Physical Stock Verification') {
    if (actualQuantity < 0) {
      throw new Error('Actual quantity cannot be negative.');
    }
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const currentInventory = await FactoryInventoryModel.findByProductId(productId);
    const systemQty = currentInventory ? currentInventory.quantity : 0;
    const diff = actualQuantity - systemQty;

    const inventory = await FactoryInventoryModel.setQuantity(productId, actualQuantity);

    if (diff !== 0) {
      await FactoryStockMovementModel.create({
        productId,
        movementType: 'Adjustment',
        quantity: diff,
        reason
      });
    }

    return inventory;
  }

  static async getFactoryInventory() {
    return await FactoryInventoryModel.findAll();
  }

  static async getFactoryStockHistory() {
    return await FactoryStockMovementModel.findAll();
  }

  // --- Retail Inventory Operations ---

  static async receiveStock({ productId, quantity, transferId }) {
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    let inventory = await RetailInventoryModel.findByProductId(productId);
    if (!inventory) {
      inventory = await RetailInventoryModel.create({ productId, quantity });
    } else {
      inventory = await RetailInventoryModel.updateQuantity(productId, quantity);
    }

    // Log the retail stock movement
    await RetailStockMovementModel.create({
      productId,
      movementType: 'Stock Received',
      quantity,
      reason: `Received from Factory - Transfer ID: ${transferId || 'N/A'}`
    });

    return inventory;
  }

  static async updateRetailStock(productId, quantity) {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const currentInventory = await RetailInventoryModel.findByProductId(productId);
    const oldQty = currentInventory ? currentInventory.quantity : 0;
    const diff = quantity - oldQty;

    let inventory = await RetailInventoryModel.setQuantity(productId, quantity);

    if (diff !== 0) {
      await RetailStockMovementModel.create({
        productId,
        movementType: 'Adjustment',
        quantity: diff,
        reason: 'Manual Correction'
      });
    }

    return inventory;
  }

  static async adjustRetailStock(productId, actualQuantity, reason = 'Physical Stock Count') {
    if (actualQuantity < 0) {
      throw new Error('Actual quantity cannot be negative.');
    }
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const currentInventory = await RetailInventoryModel.findByProductId(productId);
    const systemQty = currentInventory ? currentInventory.quantity : 0;
    const diff = actualQuantity - systemQty;

    const inventory = await RetailInventoryModel.setQuantity(productId, actualQuantity);

    if (diff !== 0) {
      await RetailStockMovementModel.create({
        productId,
        movementType: 'Adjustment',
        quantity: diff,
        reason
      });
    }

    return inventory;
  }

  static async getRetailInventory() {
    return await RetailInventoryModel.findAll();
  }

  static async getLowStock() {
    return await RetailInventoryModel.findLowStock();
  }

  static async getRetailStockHistory() {
    return await RetailStockMovementModel.findAll();
  }

  // --- Stock Transfer Operations ---

  static async transferFactoryToRetail({ productId, quantity, transferredBy }) {
    const factoryInv = await FactoryInventoryModel.findByProductId(productId);
    if (!factoryInv || factoryInv.quantity < quantity) {
      throw new Error(`Insufficient stock in Factory. Available: ${factoryInv ? factoryInv.quantity : 0}`);
    }

    await FactoryInventoryModel.updateQuantity(productId, -quantity);

    let retailInv = await RetailInventoryModel.findByProductId(productId);
    if (!retailInv) {
      await RetailInventoryModel.create({ productId, quantity });
    } else {
      await RetailInventoryModel.updateQuantity(productId, quantity);
    }

    const transfer = await StockTransferModel.create({
      productId,
      fromLocation: 'Factory',
      toLocation: 'Retail',
      quantity,
      transferredBy
    });

    // Log factory deduction movement
    await FactoryStockMovementModel.create({
      productId,
      movementType: 'Transfer to Retail',
      quantity: -quantity,
      reason: 'Transfer to Retail shop'
    });

    // Log retail addition movement
    await RetailStockMovementModel.create({
      productId,
      movementType: 'Stock Received',
      quantity,
      reason: `Transferred from Factory - Transfer ID: ${transfer.transferId}`
    });

    return transfer;
  }

  static async transferFactoryToOnline({ productId, quantity, transferredBy }) {
    const factoryInv = await FactoryInventoryModel.findByProductId(productId);
    if (!factoryInv || factoryInv.quantity < quantity) {
      throw new Error(`Insufficient stock in Factory. Available: ${factoryInv ? factoryInv.quantity : 0}`);
    }

    await FactoryInventoryModel.updateQuantity(productId, -quantity);

    const transfer = await StockTransferModel.create({
      productId,
      fromLocation: 'Factory',
      toLocation: 'Online',
      quantity,
      transferredBy
    });

    await FactoryStockMovementModel.create({
      productId,
      movementType: 'Transfer to Online',
      quantity: -quantity,
      reason: 'Online dispatch'
    });

    return transfer;
  }

  static async getTransferHistory() {
    return await StockTransferModel.findAll();
  }

  static async cancelTransfer(transferId) {
    const transfer = await StockTransferModel.findById(transferId);
    if (!transfer) {
      throw new Error('Transfer record not found.');
    }
    if (transfer.status === 'Cancelled') {
      throw new Error('Transfer is already cancelled.');
    }

    const { productId, fromLocation, toLocation, quantity } = transfer;

    if (fromLocation === 'Factory' && toLocation === 'Retail') {
      const retailInv = await RetailInventoryModel.findByProductId(productId);
      if (!retailInv || retailInv.quantity < quantity) {
        throw new Error(`Cannot cancel transfer: Insufficient Retail stock to reverse. Available: ${retailInv ? retailInv.quantity : 0}`);
      }

      await RetailInventoryModel.updateQuantity(productId, -quantity);
      await FactoryInventoryModel.updateQuantity(productId, quantity);

      await FactoryStockMovementModel.create({
        productId,
        movementType: 'Adjustment',
        quantity,
        reason: `Transfer Cancellation (Transfer ID: ${transferId})`
      });

      await RetailStockMovementModel.create({
        productId,
        movementType: 'Adjustment',
        quantity: -quantity,
        reason: `Transfer Cancellation (Transfer ID: ${transferId})`
      });
    } else if (fromLocation === 'Factory' && toLocation === 'Online') {
      await FactoryInventoryModel.updateQuantity(productId, quantity);

      await FactoryStockMovementModel.create({
        productId,
        movementType: 'Adjustment',
        quantity,
        reason: `Transfer Cancellation (Transfer ID: ${transferId})`
      });
    }

    return await StockTransferModel.updateStatus(transferId, 'Cancelled');
  }
}

export default InventoryService;
