import { query } from '../config/db.js';

class BillModel {
  static async create({
    billNumber,
    customerId,
    userId,
    subtotal,
    gstAmount,
    discountAmount = 0.00,
    grandTotal,
    paymentMethod
  }) {
    const sql = `
      INSERT INTO "Bills" 
      ("billNumber", "customerId", "userId", "subtotal", "gstAmount", "discountAmount", "grandTotal", "paymentMethod")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const res = await query(sql, [
      billNumber,
      customerId,
      userId,
      subtotal,
      gstAmount,
      discountAmount,
      grandTotal,
      paymentMethod
    ]);
    return res.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT b.*, c."customerName", c."mobile" as "customerMobile", u."name" as "userName"
      FROM "Bills" b
      LEFT JOIN "Customers" c ON b."customerId" = c."customerId"
      LEFT JOIN "Users" u ON b."userId" = u."userId"
      WHERE b."billId" = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findByBillNumber(billNumber) {
    const sql = `
      SELECT b.*, c."customerName", c."mobile" as "customerMobile", u."name" as "userName"
      FROM "Bills" b
      LEFT JOIN "Customers" c ON b."customerId" = c."customerId"
      LEFT JOIN "Users" u ON b."userId" = u."userId"
      WHERE b."billNumber" = $1
    `;
    const res = await query(sql, [billNumber]);
    return res.rows[0] || null;
  }

  static async findAll() {
    const sql = `
      SELECT b.*, c."customerName", c."mobile" as "customerMobile", u."name" as "userName"
      FROM "Bills" b
      LEFT JOIN "Customers" c ON b."customerId" = c."customerId"
      LEFT JOIN "Users" u ON b."userId" = u."userId"
      ORDER BY b."createdAt" DESC
    `;
    const res = await query(sql);
    return res.rows;
  }

  static async updatePaymentMethod(billId, paymentMethod) {
    const sql = `
      UPDATE "Bills"
      SET "paymentMethod" = $1
      WHERE "billId" = $2
      RETURNING *
    `;
    const res = await query(sql, [paymentMethod, billId]);
    return res.rows[0];
  }

  static async delete(id) {
    const sql = `DELETE FROM "Bills" WHERE "billId" = $1 RETURNING *`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  // --- Draft Bills (POS Cart) ---

  static async findActiveDraftByUserId(userId) {
    const sql = `
      SELECT * FROM "DraftBills"
      WHERE "userId" = $1
      LIMIT 1
    `;
    const res = await query(sql, [userId]);
    return res.rows[0] || null;
  }

  static async createDraft({ userId, customerId = null }) {
    const sql = `
      INSERT INTO "DraftBills" ("userId", "customerId")
      VALUES ($1, $2)
      RETURNING *
    `;
    const res = await query(sql, [userId, customerId]);
    return res.rows[0];
  }

  static async deleteDraft(draftBillId) {
    const sqlItems = `
      DELETE FROM "DraftBillItems"
      WHERE "draftBillId" = $1
    `;
    await query(sqlItems, [draftBillId]);

    const sqlBill = `
      DELETE FROM "DraftBills"
      WHERE "draftBillId" = $1
      RETURNING *
    `;
    const res = await query(sqlBill, [draftBillId]);
    return res.rows[0];
  }
}

export default BillModel;
