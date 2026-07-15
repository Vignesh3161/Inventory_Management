import InventoryService from '../services/inventory.service.js';
import { sendSuccess } from '../utils/response.js';

export const receiveStock = async (req, res, next) => {
  try {
    const { productId, quantity, transferId } = req.body;
    await InventoryService.receiveStock({ productId, quantity, transferId });
    return sendSuccess(res, 'Stock received successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateRetailStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const inventory = await InventoryService.updateRetailStock(productId, quantity);
    return sendSuccess(res, 'Retail stock updated successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const adjustRetailStock = async (req, res, next) => {
  try {
    const { productId, actualQuantity, reason } = req.body;
    const inventory = await InventoryService.adjustRetailStock(productId, actualQuantity, reason);
    return sendSuccess(res, 'Retail stock adjusted successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const getRetailInventory = async (req, res, next) => {
  try {
    const inventory = await InventoryService.getRetailInventory();
    return sendSuccess(res, 'Retail inventory retrieved successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req, res, next) => {
  try {
    const inventory = await InventoryService.getLowStock();
    return sendSuccess(res, 'Low stock items retrieved successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const getRetailStockHistory = async (req, res, next) => {
  try {
    const history = await InventoryService.getRetailStockHistory();
    return sendSuccess(res, 'Retail stock history retrieved successfully.', history);
  } catch (error) {
    next(error);
  }
};
