import { query } from '../config/db.js';

class SettingModel {
  static async getSettings() {
    const sql = `SELECT * FROM "Settings" ORDER BY "settingId" ASC LIMIT 1`;
    const res = await query(sql);
    if (res.rows[0]) {
      return res.rows[0];
    }
    // Initialize default settings if not exists
    const insertSql = `
      INSERT INTO "Settings" ("gst", "invoicePrefix", "defaultDiscount", "shopName", "shopAddress", "shopGST", "phone", "currency")
      VALUES (5.00, 'INV', 10.00, 'ABC Textiles', 'Coimbatore', '33ABCDE1234F1Z5', '9876543210', 'INR')
      RETURNING *
    `;
    const insertRes = await query(insertSql);
    return insertRes.rows[0];
  }

  static async updateGST(gst) {
    const current = await this.getSettings();
    const sql = `
      UPDATE "Settings"
      SET "gst" = $1
      WHERE "settingId" = $2
      RETURNING *
    `;
    const res = await query(sql, [gst, current.settingId]);
    return res.rows[0];
  }

  static async updateDiscount(discount) {
    const current = await this.getSettings();
    const sql = `
      UPDATE "Settings"
      SET "defaultDiscount" = $1
      WHERE "settingId" = $2
      RETURNING *
    `;
    const res = await query(sql, [discount, current.settingId]);
    return res.rows[0];
  }

  static async updateInvoicePrefix(prefix) {
    const current = await this.getSettings();
    const sql = `
      UPDATE "Settings"
      SET "invoicePrefix" = $1
      WHERE "settingId" = $2
      RETURNING *
    `;
    const res = await query(sql, [prefix, current.settingId]);
    return res.rows[0];
  }

  static async updateShopInfo({ shopName, address, phone, gstNumber }) {
    const current = await this.getSettings();
    const sql = `
      UPDATE "Settings"
      SET "shopName" = $1,
          "shopAddress" = $2,
          "phone" = $3,
          "shopGST" = $4
      WHERE "settingId" = $5
      RETURNING *
    `;
    const res = await query(sql, [shopName, address, phone, gstNumber, current.settingId]);
    return res.rows[0];
  }
}

export default SettingModel;
