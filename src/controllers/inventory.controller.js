import InventoryService from '../services/inventory.service.js';
import { sendSuccess } from '../utils/response.js';

export const addProducedStock = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const inventory = await InventoryService.addProducedStock(productId, quantity);
    return sendSuccess(res, 'Produced stock added successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const adjustFactoryStock = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const inventory = await InventoryService.adjustFactoryStock(productId, quantity);
    return sendSuccess(res, 'Factory stock adjusted successfully.', inventory);
  } catch (error) {
    next(error);
  }
};

export const adjustRetailStock = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const inventory = await InventoryService.adjustRetailStock(productId, quantity);
    return sendSuccess(res, 'Retail stock adjusted successfully.', inventory);
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
