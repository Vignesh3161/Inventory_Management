import { query } from '../config/db.js';

class RetailStockMovementModel {
  static async create({ productId, movementType, quantity, reason = null }) {
    const sql = `
      INSERT INTO "RetailStockMovements" ("productId", "movementType", "quantity", "reason")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [productId, movementType, quantity, reason]);
    return res.rows[0];
  }

  static async findAll() {
    const sql = `
      SELECT rm.*, p."productName", p."barcode"
      FROM "RetailStockMovements" rm
      LEFT JOIN "Products" p ON rm."productId" = p."productId"
      ORDER BY rm."createdAt" DESC
    `;
    const res = await query(sql);
    return res.rows;
  }
}

export default RetailStockMovementModel;
