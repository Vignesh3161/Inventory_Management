import { query } from '../config/db.js';

class ReturnModel {
  static async create({ 
    invoiceId, 
    productId, 
    quantity, 
    refundAmount, 
    returnReason = null, 
    status = 'Pending',
    type = 'Return',
    exchangedProductId = null,
    priceDifference = null
  }) {
    const sql = `
      INSERT INTO "Returns" (
        "invoiceId", "productId", "quantity", "refundAmount", 
        "returnReason", "status", "type", "exchangedProductId", "priceDifference"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const res = await query(sql, [
      invoiceId, 
      productId, 
      quantity, 
      refundAmount, 
      returnReason, 
      status, 
      type, 
      exchangedProductId, 
      priceDifference
    ]);
    return res.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT r.*, i."invoiceNumber", p."productName", p."barcode"
      FROM "Returns" r
      LEFT JOIN "Invoices" i ON r."invoiceId" = i."invoiceId"
      LEFT JOIN "Products" p ON r."productId" = p."productId"
      WHERE r."returnId" = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findAll() {
    const sql = `
      SELECT r.*, i."invoiceNumber", p."productName", p."barcode",
             ex."productName" as "exchangedProductName", ex."barcode" as "exchangedProductBarcode"
      FROM "Returns" r
      LEFT JOIN "Invoices" i ON r."invoiceId" = i."invoiceId"
      LEFT JOIN "Products" p ON r."productId" = p."productId"
      LEFT JOIN "Products" ex ON r."exchangedProductId" = ex."productId"
      ORDER BY r."createdAt" DESC
    `;
    const res = await query(sql);
    return res.rows;
  }

  static async updateStatus(id, status) {
    const sql = `
      UPDATE "Returns"
      SET "status" = $1
      WHERE "returnId" = $2
      RETURNING *
    `;
    const res = await query(sql, [status, id]);
    return res.rows[0];
  }

  static async updateRefund(id, status, refundMethod, refundDate = new Date()) {
    const sql = `
      UPDATE "Returns"
      SET "status" = $1, "refundMethod" = $2, "refundDate" = $3
      WHERE "returnId" = $4
      RETURNING *
    `;
    const res = await query(sql, [status, refundMethod, refundDate, id]);
    return res.rows[0];
  }

  static async getAlreadyReturnedQuantity(invoiceId, productId) {
    const sql = `
      SELECT COALESCE(SUM("quantity"), 0) as "totalReturned"
      FROM "Returns"
      WHERE "invoiceId" = $1 AND "productId" = $2 AND "status" != 'Rejected'
    `;
    const res = await query(sql, [invoiceId, productId]);
    return parseInt(res.rows[0].totalReturned || 0);
  }
}

export default ReturnModel;
