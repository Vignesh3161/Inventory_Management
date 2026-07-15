import { query } from '../config/db.js';

class RetailInventoryModel {
  static async create({ productId, quantity = 0, minimumStock = 5 }) {
    const sql = `
      INSERT INTO "RetailInventory" ("productId", "quantity", "minimumStock")
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const res = await query(sql, [productId, quantity, minimumStock]);
    return res.rows[0];
  }

  static async findByProductId(productId) {
    const sql = `
      SELECT ri.*, p."productName", p."barcode"
      FROM "RetailInventory" ri
      LEFT JOIN "Products" p ON ri."productId" = p."productId"
      WHERE ri."productId" = $1
    `;
    const res = await query(sql, [productId]);
    return res.rows[0] || null;
  }

  static async findAll() {
    const sql = `
      SELECT ri.*, p."productName", p."barcode"
      FROM "RetailInventory" ri
      LEFT JOIN "Products" p ON ri."productId" = p."productId"
      ORDER BY ri."lastUpdated" DESC
    `;
    const res = await query(sql);
    return res.rows;
  }

  static async updateQuantity(productId, quantityChange) {
    const checkSql = `SELECT * FROM "RetailInventory" WHERE "productId" = $1`;
    const checkRes = await query(checkSql, [productId]);

    if (checkRes.rows.length === 0) {
      return await this.create({ productId, quantity: quantityChange });
    }

    const sql = `
      UPDATE "RetailInventory"
      SET "quantity" = "quantity" + $1, "lastUpdated" = CURRENT_TIMESTAMP
      WHERE "productId" = $2
      RETURNING *
    `;
    const res = await query(sql, [quantityChange, productId]);
    return res.rows[0];
  }

  static async setQuantity(productId, quantity) {
    const checkSql = `SELECT * FROM "RetailInventory" WHERE "productId" = $1`;
    const checkRes = await query(checkSql, [productId]);

    if (checkRes.rows.length === 0) {
      return await this.create({ productId, quantity });
    }

    const sql = `
      UPDATE "RetailInventory"
      SET "quantity" = $1, "lastUpdated" = CURRENT_TIMESTAMP
      WHERE "productId" = $2
      RETURNING *
    `;
    const res = await query(sql, [quantity, productId]);
    return res.rows[0];
  }

  static async findLowStock() {
    const sql = `
      SELECT ri.*, p."productName", p."barcode"
      FROM "RetailInventory" ri
      LEFT JOIN "Products" p ON ri."productId" = p."productId"
      WHERE ri."quantity" <= ri."minimumStock"
      ORDER BY ri."quantity" ASC
    `;
    const res = await query(sql);
    return res.rows;
  }
}

export default RetailInventoryModel;
