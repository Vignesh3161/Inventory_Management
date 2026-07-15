import SaleModel from '../models/sale.model.js';

class SalesService {
  static async logSale({ billId, invoiceId, totalAmount, paymentMethod }) {
    return await SaleModel.create({
      billId,
      invoiceId,
      totalAmount,
      paymentMethod
    });
  }

  static async getSalesReport(startDate, endDate) {
    return await SaleModel.getSalesReport(startDate, endDate);
  }

  static async getDailySales(dateStr) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    return await SaleModel.getDailySales(targetDate);
  }

  static async getMonthlySales(monthStr) {
    const targetMonth = monthStr || new Date().toISOString().slice(0, 7);
    return await SaleModel.getMonthlySales(targetMonth);
  }

  static async getYearlySales(yearStr) {
    const targetYear = yearStr || new Date().getFullYear().toString();
    return await SaleModel.getYearlySales(targetYear);
  }

  static async getSalesByProduct() {
    return await SaleModel.getSalesByProduct();
  }

  static async getSalesByStaff() {
    return await SaleModel.getSalesByStaff();
  }

  static async getSalesByCategory() {
    return await SaleModel.getSalesByCategory();
  }

  static async getSalesByBrand() {
    return await SaleModel.getSalesByBrand();
  }
}

export default SalesService;
