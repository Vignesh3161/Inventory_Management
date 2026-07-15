import { query } from '../config/db.js';

class StockTransferModel {
  static async create({ productId, fromLocation, toLocation, quantity, transferredBy, status = 'Completed' }) {
    const sql = `
      INSERT INTO "StockTransfers" ("productId", "fromLocation", "toLocation", "quantity", "transferredBy", "status")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const res = await query(sql, [productId, fromLocation, toLocation, quantity, transferredBy, status]);
    return res.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT st.*, p."productName", p."barcode", u."name" as "transferredByName"
      FROM "StockTransfers" st
      LEFT JOIN "Products" p ON st."productId" = p."productId"
      LEFT JOIN "Users" u ON st."transferredBy" = u."userId"
      WHERE st."transferId" = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findAll() {
    const sql = `
      SELECT st.*, p."productName", p."barcode", u."name" as "transferredByName"
      FROM "StockTransfers" st
      LEFT JOIN "Products" p ON st."productId" = p."productId"
      LEFT JOIN "Users" u ON st."transferredBy" = u."userId"
      ORDER BY st."transferDate" DESC
    `;
    const res = await query(sql);
    return res.rows;
  }

  static async updateStatus(transferId, status) {
    const sql = `
      UPDATE "StockTransfers"
      SET "status" = $1
      WHERE "transferId" = $2
      RETURNING *
    `;
    const res = await query(sql, [status, transferId]);
    return res.rows[0];
  }

  static async findByProductId(productId) {
    const sql = `
      SELECT st.*, p."productName", p."barcode", u."name" as "transferredByName"
      FROM "StockTransfers" st
      LEFT JOIN "Products" p ON st."productId" = p."productId"
      LEFT JOIN "Users" u ON st."transferredBy" = u."userId"
      WHERE st."productId" = $1
      ORDER BY st."transferDate" DESC
    `;
    const res = await query(sql, [productId]);
    return res.rows;
  }
}

export default StockTransferModel;
