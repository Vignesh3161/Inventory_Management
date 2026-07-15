import ReportService from '../services/report.service.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const data = await ReportService.getDashboardSummary();
    return sendSuccess(res, 'Dashboard summary retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getSalesReport = async (req, res, next) => {
  try {
    const { filter, startDate, endDate } = req.query;
    const data = await ReportService.getSalesReport({ filter, startDate, endDate });
    return sendSuccess(res, 'Sales report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getInventoryReport = async (req, res, next) => {
  try {
    const data = await ReportService.getInventoryReport();
    return sendSuccess(res, 'Inventory report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getFactoryInventoryReport = async (req, res, next) => {
  try {
    const data = await ReportService.getFactoryInventoryReport();
    return sendSuccess(res, 'Factory inventory report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getRetailInventoryReport = async (req, res, next) => {
  try {
    const data = await ReportService.getRetailInventoryReport();
    return sendSuccess(res, 'Retail inventory report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getStockTransferReport = async (req, res, next) => {
  try {
    const data = await ReportService.getStockTransferReport();
    return sendSuccess(res, 'Stock transfer report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getGSTReport = async (req, res, next) => {
  try {
    const data = await ReportService.getGSTReport();
    return sendSuccess(res, 'GST report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getProfitReport = async (req, res, next) => {
  try {
    const data = await ReportService.getProfitReport();
    return sendSuccess(res, 'Profit report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getLowStockReport = async (req, res, next) => {
  try {
    const data = await ReportService.getLowStockReport();
    return sendSuccess(res, 'Low stock report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getBestSellingProducts = async (req, res, next) => {
  try {
    const data = await ReportService.getBestSellingProducts();
    return sendSuccess(res, 'Best selling products retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};
