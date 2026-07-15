import SalesService from '../services/sales.service.js';
import { sendSuccess } from '../utils/response.js';

export const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await SalesService.getSalesReport(startDate, endDate);
    return sendSuccess(res, 'Sales report retrieved successfully.', report);
  } catch (error) {
    next(error);
  }
};

export const getDailySales = async (req, res, next) => {
  try {
    const { date } = req.query;
    const data = await SalesService.getDailySales(date);
    return sendSuccess(res, 'Daily sales report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getMonthlySales = async (req, res, next) => {
  try {
    const { month } = req.query;
    const data = await SalesService.getMonthlySales(month);
    return sendSuccess(res, 'Monthly sales report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getYearlySales = async (req, res, next) => {
  try {
    const { year } = req.query;
    const data = await SalesService.getYearlySales(year);
    return sendSuccess(res, 'Yearly sales report retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getSalesByProduct = async (req, res, next) => {
  try {
    const data = await SalesService.getSalesByProduct();
    return sendSuccess(res, 'Sales by product retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getSalesByStaff = async (req, res, next) => {
  try {
    const data = await SalesService.getSalesByStaff();
    return sendSuccess(res, 'Sales by staff retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getSalesByCategory = async (req, res, next) => {
  try {
    const data = await SalesService.getSalesByCategory();
    return sendSuccess(res, 'Sales by category retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};

export const getSalesByBrand = async (req, res, next) => {
  try {
    const data = await SalesService.getSalesByBrand();
    return sendSuccess(res, 'Sales by brand retrieved successfully.', data);
  } catch (error) {
    next(error);
  }
};
