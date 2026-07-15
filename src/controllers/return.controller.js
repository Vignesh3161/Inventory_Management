import ReturnService from '../services/return.service.js';
import { sendSuccess } from '../utils/response.js';

export const processReturn = async (req, res, next) => {
  try {
    await ReturnService.processReturn(req.body);
    return sendSuccess(res, 'Product returned successfully.');
  } catch (error) {
    next(error);
  }
};

export const processExchange = async (req, res, next) => {
  try {
    const result = await ReturnService.processExchange(req.body);
    return sendSuccess(res, 'Product exchanged successfully.', {
      priceDifference: result.priceDifference
    });
  } catch (error) {
    next(error);
  }
};

export const processRefund = async (req, res, next) => {
  try {
    const { returnId, refundMethod } = req.body;
    await ReturnService.processRefund({ returnId, refundMethod });
    return sendSuccess(res, 'Refund processed successfully.');
  } catch (error) {
    next(error);
  }
};

export const getReturnHistory = async (req, res, next) => {
  try {
    const history = await ReturnService.getReturnHistory();
    return sendSuccess(res, 'Return history retrieved successfully.', history);
  } catch (error) {
    next(error);
  }
};
