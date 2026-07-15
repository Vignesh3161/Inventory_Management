import InventoryService from '../services/inventory.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const addProducedStock = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    await InventoryService.addProducedStock(productId, quantity);
    return sendSuccess(res, 'Factory stock added successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateFactoryStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const inventory = await InventoryService.updateFactoryStock(productId, quantity);
    return sendSuccess(res, 'Factory stock updated successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const removeFactoryStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, reason } = req.body;
    const inventory = await InventoryService.removeFactoryStock(productId, quantity, reason);
    return sendSuccess(res, 'Factory stock removed successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const adjustFactoryStock = async (req, res, next) => {
  try {
    const { productId, actualQuantity, reason } = req.body;
    const inventory = await InventoryService.adjustFactoryStock(productId, actualQuantity, reason);
    return sendSuccess(res, 'Factory stock adjusted successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const getFactoryInventory = async (req, res, next) => {
  try {
    const inventory = await InventoryService.getFactoryInventory();
    return sendSuccess(res, 'Factory inventory retrieved successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const getFactoryStockHistory = async (req, res, next) => {
  try {
    const history = await InventoryService.getFactoryStockHistory();
    return sendSuccess(res, 'Factory stock history retrieved successfully.', history);
  } catch (error) {
    next(error);
  }
};
