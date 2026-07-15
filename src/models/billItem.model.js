import { query } from '../config/db.js';

class BillItemModel {
  static async create({ billId, productId, quantity, price, gst, discount = 0.00, total }) {
    const sql = `
      INSERT INTO "BillItems" ("billId", "productId", "quantity", "price", "gst", "discount", "total")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const res = await query(sql, [billId, productId, quantity, price, gst, discount, total]);
    return res.rows[0];
  }

  static async findByBillId(billId) {
    const sql = `
      SELECT bi.*, p."productName", p."barcode"
      FROM "BillItems" bi
      LEFT JOIN "Products" p ON bi."productId" = p."productId"
      WHERE bi."billId" = $1
      ORDER BY bi."billItemId" ASC
    `;
    const res = await query(sql, [billId]);
    return res.rows;
  }

  static async deleteByBillId(billId) {
    const sql = `DELETE FROM "BillItems" WHERE "billId" = $1 RETURNING *`;
    const res = await query(sql, [billId]);
    return res.rows;
  }

  // --- Draft Bill Items (POS Cart Items) ---

  static async findDraftItemsByDraftBillId(draftBillId) {
    const sql = `
      SELECT dbi.*, p."productName", p."barcode", p."mrp", p."gst", p."discount"
      FROM "DraftBillItems" dbi
      LEFT JOIN "Products" p ON dbi."productId" = p."productId"
      WHERE dbi."draftBillId" = $1
    `;
    const res = await query(sql, [draftBillId]);
    return res.rows;
  }

  static async findDraftItemById(draftItemId) {
    const sql = `
      SELECT dbi.*, p."productName", p."barcode", p."mrp", p."gst", p."discount"
      FROM "DraftBillItems" dbi
      LEFT JOIN "Products" p ON dbi."productId" = p."productId"
      WHERE dbi."draftItemId" = $1
    `;
    const res = await query(sql, [draftItemId]);
    return res.rows[0] || null;
  }

  static async addDraftItem({ draftBillId, productId, quantity }) {
    const checkSql = `
      SELECT * FROM "DraftBillItems"
      WHERE "draftBillId" = $1 AND "productId" = $2
    `;
    const checkRes = await query(checkSql, [draftBillId, productId]);

    if (checkRes.rows.length > 0) {
      const updateSql = `
        UPDATE "DraftBillItems"
        SET "quantity" = "quantity" + $1
        WHERE "draftBillId" = $2 AND "productId" = $3
        RETURNING *
      `;
      const updateRes = await query(updateSql, [quantity, draftBillId, productId]);
      return updateRes.rows[0];
    } else {
      const insertSql = `
        INSERT INTO "DraftBillItems" ("draftBillId", "productId", "quantity")
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const insertRes = await query(insertSql, [draftBillId, productId, quantity]);
      return insertRes.rows[0];
    }
  }

  static async updateDraftItemQuantity(draftItemId, quantity) {
    const sql = `
      UPDATE "DraftBillItems"
      SET "quantity" = $1
      WHERE "draftItemId" = $2
      RETURNING *
    `;
    const res = await query(sql, [quantity, draftItemId]);
    return res.rows[0];
  }

  static async removeDraftItem(draftItemId) {
    const sql = `
      DELETE FROM "DraftBillItems"
      WHERE "draftItemId" = $1
      RETURNING *
    `;
    const res = await query(sql, [draftItemId]);
    return res.rows[0];
  }
}

export default BillItemModel;
