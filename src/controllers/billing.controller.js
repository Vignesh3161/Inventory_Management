import BillingService from '../services/billing.service.js';
import { sendSuccess } from '../utils/response.js';

export const scanBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.body;
    const details = await BillingService.scanBarcode(barcode);
    return sendSuccess(res, 'Barcode scanned successfully.', details);
  } catch (error) {
    next(error);
  }
};

export const searchProduct = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await BillingService.searchProducts(q);
    return sendSuccess(res, 'Products searched successfully.', results);
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const item = await BillingService.addDraftItem({
      userId: req.user.userId,
      productId,
      quantity
    });
    return sendSuccess(res, 'Item added to draft bill successfully.', item, 201);
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    await BillingService.removeDraftItem(itemId);
    return sendSuccess(res, 'Item removed from draft bill successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const item = await BillingService.updateDraftItemQuantity(itemId, quantity);
    return sendSuccess(res, 'Item quantity updated successfully.', item);
  } catch (error) {
    next(error);
  }
};

export const generateBillFromDraft = async (req, res, next) => {
  try {
    const { customerId } = req.body;
    const result = await BillingService.generateBillFromDraft({
      userId: req.user.userId,
      customerId
    });
    return sendSuccess(res, 'Bill generated from draft successfully.', {
      billNumber: result.billNumber,
      grandTotal: result.grandTotal,
      billId: result.billId
    });
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (req, res, next) => {
  try {
    const { billId, paymentMethod } = req.body;
    const transaction = await BillingService.processPayment({
      billId,
      paymentMethod
    });
    return sendSuccess(res, 'Payment processed successfully.', transaction);
  } catch (error) {
    next(error);
  }
};

export const getBillDetails = async (req, res, next) => {
  try {
    const details = await BillingService.getBillDetails(req.params.id);
    return sendSuccess(res, 'Bill details retrieved successfully.', details);
  } catch (error) {
    next(error);
  }
};
