import { query } from '../config/db.js';

class CustomerModel {
  static async create({ customerName = null, mobile, status = 'Active' }) {
    const sql = `
      INSERT INTO "Customers" ("customerName", "mobile", "status")
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const res = await query(sql, [customerName, mobile, status]);
    return res.rows[0];
  }

  static async findById(id) {
    const sql = `SELECT * FROM "Customers" WHERE "customerId" = $1`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findByMobile(mobile) {
    const sql = `SELECT * FROM "Customers" WHERE "mobile" = $1`;
    const res = await query(sql, [mobile]);
    return res.rows[0] || null;
  }

  static async findAll() {
    const sql = `SELECT * FROM "Customers" ORDER BY "customerId" ASC`;
    const res = await query(sql);
    return res.rows;
  }

  static async update(id, fields) {
    const setClause = [];
    const values = [];
    let i = 1;
    for (const [key, val] of Object.entries(fields)) {
      setClause.push(`"${key}" = $${i}`);
      values.push(val);
      i++;
    }
    if (setClause.length === 0) return null;

    values.push(id);
    const sql = `
      UPDATE "Customers"
      SET ${setClause.join(', ')}
      WHERE "customerId" = $${i}
      RETURNING *
    `;
    const res = await query(sql, values);
    return res.rows[0];
  }

  static async delete(id) {
    const sql = `DELETE FROM "Customers" WHERE "customerId" = $1 RETURNING *`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async hasPurchaseHistory(customerId) {
    const sql = `SELECT 1 FROM "Bills" WHERE "customerId" = $1 LIMIT 1`;
    const res = await query(sql, [customerId]);
    return res.rows.length > 0;
  }

  static async getPurchaseHistory(customerId) {
    const sql = `
      SELECT i."invoiceNumber", i."createdAt", b."grandTotal"
      FROM "Invoices" i
      LEFT JOIN "Bills" b ON i."billId" = b."billId"
      WHERE b."customerId" = $1
      ORDER BY i."createdAt" DESC
    `;
    const res = await query(sql, [customerId]);
    return res.rows;
  }
}

export default CustomerModel;
