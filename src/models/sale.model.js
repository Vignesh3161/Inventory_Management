import { query } from '../config/db.js';

class SaleModel {
  static async create({ billId, invoiceId, totalAmount, paymentMethod }) {
    const sql = `
      INSERT INTO "Sales" ("billId", "invoiceId", "totalAmount", "paymentMethod")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [billId, invoiceId, totalAmount, paymentMethod]);
    return res.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT s.*, b."billNumber", i."invoiceNumber"
      FROM "Sales" s
      LEFT JOIN "Bills" b ON s."billId" = b."billId"
      LEFT JOIN "Invoices" i ON s."invoiceId" = i."invoiceId"
      WHERE s."saleId" = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findAll() {
    const sql = `
      SELECT s.*, b."billNumber", i."invoiceNumber"
      FROM "Sales" s
      LEFT JOIN "Bills" b ON s."billId" = b."billId"
      LEFT JOIN "Invoices" i ON s."invoiceId" = i."invoiceId"
      ORDER BY s."saleDate" DESC
    `;
    const res = await query(sql);
    return res.rows;
  }

  static async getSalesReport(startDate, endDate) {
    const sql = `
      SELECT s.*, b."billNumber", i."invoiceNumber"
      FROM "Sales" s
      LEFT JOIN "Bills" b ON s."billId" = b."billId"
      LEFT JOIN "Invoices" i ON s."invoiceId" = i."invoiceId"
      WHERE s."saleDate" >= $1 AND s."saleDate" <= $2
      ORDER BY s."saleDate" DESC
    `;
    const res = await query(sql, [startDate, endDate]);
    return res.rows;
  }

  static async getDailySales(dateStr) {
    const statsSql = `
      SELECT 
        COUNT(DISTINCT s."billId") as "totalBills",
        COALESCE(SUM(s."totalAmount"), 0) as "totalRevenue",
        COALESCE(SUM(bi."quantity"), 0) as "totalQuantitySold"
      FROM "Sales" s
      LEFT JOIN "BillItems" bi ON s."billId" = bi."billId"
      WHERE DATE(s."saleDate") = $1
    `;
    const paymentSql = `
      SELECT 
        s."paymentMethod",
        COUNT(DISTINCT s."billId") as "count",
        COALESCE(SUM(s."totalAmount"), 0) as "revenue"
      FROM "Sales" s
      WHERE DATE(s."saleDate") = $1
      GROUP BY s."paymentMethod"
    `;
    const statsRes = await query(statsSql, [dateStr]);
    const paymentRes = await query(paymentSql, [dateStr]);
    return {
      date: dateStr,
      totalBills: parseInt(statsRes.rows[0].totalBills || 0),
      totalRevenue: parseFloat(statsRes.rows[0].totalRevenue || 0),
      totalQuantitySold: parseInt(statsRes.rows[0].totalQuantitySold || 0),
      paymentSummary: paymentRes.rows.map(r => ({
        paymentMethod: r.paymentMethod,
        count: parseInt(r.count),
        revenue: parseFloat(r.revenue)
      }))
    };
  }

  static async getMonthlySales(monthStr) {
    const sql = `
      SELECT 
        COUNT(DISTINCT s."billId") as "totalBills",
        COALESCE(SUM(s."totalAmount"), 0) as "totalRevenue",
        COALESCE(SUM(bi."quantity"), 0) as "totalQuantitySold"
      FROM "Sales" s
      LEFT JOIN "BillItems" bi ON s."billId" = bi."billId"
      WHERE TO_CHAR(s."saleDate", 'YYYY-MM') = $1
    `;
    const res = await query(sql, [monthStr]);
    return {
      month: monthStr,
      totalBills: parseInt(res.rows[0].totalBills || 0),
      totalRevenue: parseFloat(res.rows[0].totalRevenue || 0),
      totalQuantitySold: parseInt(res.rows[0].totalQuantitySold || 0)
    };
  }

  static async getYearlySales(yearStr) {
    const sql = `
      SELECT 
        COUNT(DISTINCT s."billId") as "totalBills",
        COALESCE(SUM(s."totalAmount"), 0) as "totalRevenue",
        COALESCE(SUM(bi."quantity"), 0) as "totalQuantitySold"
      FROM "Sales" s
      LEFT JOIN "BillItems" bi ON s."billId" = bi."billId"
      WHERE TO_CHAR(s."saleDate", 'YYYY') = $1
    `;
    const res = await query(sql, [yearStr]);
    return {
      year: yearStr,
      totalBills: parseInt(res.rows[0].totalBills || 0),
      totalRevenue: parseFloat(res.rows[0].totalRevenue || 0),
      totalQuantitySold: parseInt(res.rows[0].totalQuantitySold || 0)
    };
  }

  static async getSalesByProduct() {
    const sql = `
      SELECT 
        p."productId",
        p."productName",
        p."barcode",
        COALESCE(SUM(bi."quantity"), 0) as "quantitySold",
        COALESCE(SUM(bi."total"), 0) as "revenue"
      FROM "Sales" s
      JOIN "BillItems" bi ON s."billId" = bi."billId"
      JOIN "Products" p ON bi."productId" = p."productId"
      GROUP BY p."productId", p."productName", p."barcode"
      ORDER BY "quantitySold" DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      productId: r.productId,
      productName: r.productName,
      barcode: r.barcode,
      quantitySold: parseInt(r.quantitySold || 0),
      revenue: parseFloat(r.revenue || 0)
    }));
  }

  static async getSalesByStaff() {
    const sql = `
      SELECT 
        u."userId",
        u."name" as "staffName",
        COUNT(DISTINCT s."billId") as "billsCount",
        COALESCE(SUM(s."totalAmount"), 0) as "revenue"
      FROM "Sales" s
      JOIN "Bills" b ON s."billId" = b."billId"
      JOIN "Users" u ON b."userId" = u."userId"
      GROUP BY u."userId", u."name"
      ORDER BY "revenue" DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      userId: r.userId,
      staffName: r.staffName,
      billsCount: parseInt(r.billsCount || 0),
      revenue: parseFloat(r.revenue || 0)
    }));
  }

  static async getSalesByCategory() {
    const sql = `
      SELECT 
        c."categoryId",
        c."categoryName",
        COALESCE(SUM(bi."total"), 0) as "revenue"
      FROM "Sales" s
      JOIN "BillItems" bi ON s."billId" = bi."billId"
      JOIN "Products" p ON bi."productId" = p."productId"
      JOIN "Categories" c ON p."categoryId" = c."categoryId"
      GROUP BY c."categoryId", c."categoryName"
      ORDER BY "revenue" DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      revenue: parseFloat(r.revenue || 0)
    }));
  }

  static async getSalesByBrand() {
    const sql = `
      SELECT 
        b."brandId",
        b."brandName",
        COALESCE(SUM(bi."total"), 0) as "revenue"
      FROM "Sales" s
      JOIN "BillItems" bi ON s."billId" = bi."billId"
      JOIN "Products" p ON bi."productId" = p."productId"
      JOIN "Brands" b ON p."brandId" = b."brandId"
      GROUP BY b."brandId", b."brandName"
      ORDER BY "revenue" DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      brandId: r.brandId,
      brandName: r.brandName,
      revenue: parseFloat(r.revenue || 0)
    }));
  }
}

export default SaleModel;
