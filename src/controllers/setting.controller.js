import SettingModel from '../models/setting.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await SettingModel.getSettings();
    return sendSuccess(res, 'Settings retrieved successfully.', {
      shopName: settings.shopName,
      gst: parseFloat(settings.gst),
      invoicePrefix: settings.invoicePrefix,
      defaultDiscount: parseFloat(settings.defaultDiscount)
    });
  } catch (error) {
    next(error);
  }
};

export const updateGST = async (req, res, next) => {
  try {
    const { gstPercentage } = req.body;
    if (gstPercentage === undefined || typeof gstPercentage !== 'number' || gstPercentage < 0) {
      return sendError(res, 'Invalid gstPercentage. Must be a non-negative number.', null, 400);
    }

    const updated = await SettingModel.updateGST(gstPercentage);
    return sendSuccess(res, 'GST percentage updated successfully.', {
      gst: parseFloat(updated.gst)
    });
  } catch (error) {
    next(error);
  }
};

export const updateDiscount = async (req, res, next) => {
  try {
    const { defaultDiscount } = req.body;
    if (defaultDiscount === undefined || typeof defaultDiscount !== 'number' || defaultDiscount < 0 || defaultDiscount > 100) {
      return sendError(res, 'Invalid defaultDiscount. Must be a percentage between 0 and 100.', null, 400);
    }

    const updated = await SettingModel.updateDiscount(defaultDiscount);
    return sendSuccess(res, 'Default discount updated successfully.', {
      defaultDiscount: parseFloat(updated.defaultDiscount)
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvoicePrefix = async (req, res, next) => {
  try {
    const { invoicePrefix } = req.body;
    if (!invoicePrefix || typeof invoicePrefix !== 'string' || invoicePrefix.trim().length === 0) {
      return sendError(res, 'Invalid invoicePrefix. Must be a non-empty string.', null, 400);
    }

    const updated = await SettingModel.updateInvoicePrefix(invoicePrefix.trim());
    return sendSuccess(res, 'Invoice prefix updated successfully.', {
      invoicePrefix: updated.invoicePrefix
    });
  } catch (error) {
    next(error);
  }
};

export const updateShopInfo = async (req, res, next) => {
  try {
    const { shopName, address, phone, gstNumber } = req.body;
    if (!shopName || !address || !phone || !gstNumber) {
      return sendError(res, 'shopName, address, phone, and gstNumber are required fields.', null, 400);
    }

    const updated = await SettingModel.updateShopInfo({ shopName, address, phone, gstNumber });
    return sendSuccess(res, 'Shop information updated successfully.');
  } catch (error) {
    next(error);
  }
};
