import InventoryService from '../services/inventory.service.js';
import { sendSuccess } from '../utils/response.js';

export const transferFactoryToRetail = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    await InventoryService.transferFactoryToRetail({
      productId,
      quantity,
      transferredBy: req.user.userId
    });
    return sendSuccess(res, 'Stock transferred successfully.');
  } catch (error) {
    next(error);
  }
};

export const transferFactoryToOnline = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    await InventoryService.transferFactoryToOnline({
      productId,
      quantity,
      transferredBy: req.user.userId
    });
    return sendSuccess(res, 'Online dispatch recorded successfully.');
  } catch (error) {
    next(error);
  }
};

export const getTransferHistory = async (req, res, next) => {
  try {
    const transfers = await InventoryService.getTransferHistory();
    return sendSuccess(res, 'Transfer history retrieved successfully.', transfers);
  } catch (error) {
    next(error);
  }
};

export const cancelTransfer = async (req, res, next) => {
  try {
    const { transferId } = req.params;
    const transfer = await InventoryService.cancelTransfer(transferId);
    return sendSuccess(res, 'Stock transfer cancelled successfully.', transfer);
  } catch (error) {
    next(error);
  }
};
