import { query } from '../config/db.js';

class InvoiceModel {
  static async create({ invoiceNumber, billId, invoiceStatus = 'Paid', pdfUrl }) {
    const sql = `
      INSERT INTO "Invoices" ("invoiceNumber", "billId", "invoiceStatus", "pdfUrl")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [invoiceNumber, billId, invoiceStatus, pdfUrl]);
    return res.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT i.*, b."billNumber", b."grandTotal", b."subtotal", b."gstAmount", b."discountAmount", b."paymentMethod",
             c."customerName", c."mobile" as "customerMobile",
             u."name" as "userName"
      FROM "Invoices" i
      LEFT JOIN "Bills" b ON i."billId" = b."billId"
      LEFT JOIN "Customers" c ON b."customerId" = c."customerId"
      LEFT JOIN "Users" u ON b."userId" = u."userId"
      WHERE i."invoiceId" = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findByInvoiceNumber(invoiceNumber) {
    const sql = `
      SELECT i.*, b."billNumber", b."grandTotal", b."subtotal", b."gstAmount", b."discountAmount", b."paymentMethod",
             c."customerName", c."mobile" as "customerMobile",
             u."name" as "userName"
      FROM "Invoices" i
      LEFT JOIN "Bills" b ON i."billId" = b."billId"
      LEFT JOIN "Customers" c ON b."customerId" = c."customerId"
      LEFT JOIN "Users" u ON b."userId" = u."userId"
      WHERE i."invoiceNumber" = $1
    `;
    const res = await query(sql, [invoiceNumber]);
    return res.rows[0] || null;
  }

  static async findByBillId(billId) {
    const sql = `SELECT * FROM "Invoices" WHERE "billId" = $1`;
    const res = await query(sql, [billId]);
    return res.rows[0] || null;
  }

  static async findAll({ startDate, endDate, customerId, invoiceNumber, limit = 10, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    if (startDate) {
      conditions.push(`i."createdAt" >= $${i}`);
      values.push(startDate);
      i++;
    }
    if (endDate) {
      conditions.push(`i."createdAt" <= $${i}`);
      values.push(endDate);
      i++;
    }
    if (customerId) {
      conditions.push(`b."customerId" = $${i}`);
      values.push(customerId);
      i++;
    }
    if (invoiceNumber) {
      conditions.push(`i."invoiceNumber" ILIKE $${i}`);
      values.push(`%${invoiceNumber}%`);
      i++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT i.*, b."billNumber", b."grandTotal", c."customerName", c."mobile" as "customerMobile"
      FROM "Invoices" i
      LEFT JOIN "Bills" b ON i."billId" = b."billId"
      LEFT JOIN "Customers" c ON b."customerId" = c."customerId"
      ${whereClause}
      ORDER BY i."createdAt" DESC
      LIMIT $${i} OFFSET $${i + 1}
    `;

    values.push(parseInt(limit), parseInt(offset));
    const res = await query(sql, values);
    return res.rows;
  }

  static async updateStatus(id, invoiceStatus) {
    const sql = `
      UPDATE "Invoices"
      SET "invoiceStatus" = $1
      WHERE "invoiceId" = $2
      RETURNING *
    `;
    const res = await query(sql, [invoiceStatus, id]);
    return res.rows[0];
  }

  static async updateStatusAndReason(id, invoiceStatus, cancellationReason = null) {
    const sql = `
      UPDATE "Invoices"
      SET "invoiceStatus" = $1, "cancellationReason" = $2
      WHERE "invoiceId" = $3
      RETURNING *
    `;
    const res = await query(sql, [invoiceStatus, cancellationReason, id]);
    return res.rows[0];
  }
}

export default InvoiceModel;
