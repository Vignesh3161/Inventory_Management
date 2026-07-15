import { query } from '../config/db.js';

class FactoryStockMovementModel {
  static async create({ productId, movementType, quantity, reason = null }) {
    const sql = `
      INSERT INTO "FactoryStockMovements" ("productId", "movementType", "quantity", "reason")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [productId, movementType, quantity, reason]);
    return res.rows[0];
  }

  static async findAll() {
    const sql = `
      SELECT fm.*, p."productName", p."barcode"
      FROM "FactoryStockMovements" fm
      LEFT JOIN "Products" p ON fm."productId" = p."productId"
      ORDER BY fm."createdAt" DESC
    `;
    const res = await query(sql);
    return res.rows;
  }
}

export default FactoryStockMovementModel;
