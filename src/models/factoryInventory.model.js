import { query } from '../config/db.js';

class FactoryInventoryModel {
  static async create({ productId, quantity = 0 }) {
    const sql = `
      INSERT INTO "FactoryInventory" ("productId", "quantity")
      VALUES ($1, $2)
      RETURNING *
    `;
    const res = await query(sql, [productId, quantity]);
    return res.rows[0];
  }

  static async findByProductId(productId) {
    const sql = `
      SELECT fi.*, p."productName", p."barcode"
      FROM "FactoryInventory" fi
      LEFT JOIN "Products" p ON fi."productId" = p."productId"
      WHERE fi."productId" = $1
    `;
    const res = await query(sql, [productId]);
    return res.rows[0] || null;
  }

  static async findAll() {
    const sql = `
      SELECT fi.*, p."productName", p."barcode"
      FROM "FactoryInventory" fi
      LEFT JOIN "Products" p ON fi."productId" = p."productId"
      ORDER BY fi."lastUpdated" DESC
    `;
    const res = await query(sql);
    return res.rows;
  }

  static async updateQuantity(productId, quantityChange) {
    const checkSql = `SELECT * FROM "FactoryInventory" WHERE "productId" = $1`;
    const checkRes = await query(checkSql, [productId]);

    if (checkRes.rows.length === 0) {
      return await this.create({ productId, quantity: quantityChange });
    }

    const sql = `
      UPDATE "FactoryInventory"
      SET "quantity" = "quantity" + $1, "lastUpdated" = CURRENT_TIMESTAMP
      WHERE "productId" = $2
      RETURNING *
    `;
    const res = await query(sql, [quantityChange, productId]);
    return res.rows[0];
  }

  static async setQuantity(productId, quantity) {
    const checkSql = `SELECT * FROM "FactoryInventory" WHERE "productId" = $1`;
    const checkRes = await query(checkSql, [productId]);

    if (checkRes.rows.length === 0) {
      return await this.create({ productId, quantity });
    }

    const sql = `
      UPDATE "FactoryInventory"
      SET "quantity" = $1, "lastUpdated" = CURRENT_TIMESTAMP
      WHERE "productId" = $2
      RETURNING *
    `;
    const res = await query(sql, [quantity, productId]);
    return res.rows[0];
  }
}

export default FactoryInventoryModel;
