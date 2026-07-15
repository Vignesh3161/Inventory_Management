import { query } from '../config/db.js';

class BrandModel {
  static async create(brandName) {
    const sql = `INSERT INTO "Brands" ("brandName") VALUES ($1) RETURNING *`;
    const res = await query(sql, [brandName]);
    return res.rows[0];
  }

  static async findAll() {
    const sql = `SELECT * FROM "Brands" ORDER BY "brandId" ASC`;
    const res = await query(sql);
    return res.rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM "Brands" WHERE "brandId" = $1`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findByName(brandName) {
    const sql = `SELECT * FROM "Brands" WHERE "brandName" = $1`;
    const res = await query(sql, [brandName]);
    return res.rows[0] || null;
  }

  static async update(id, brandName) {
    const sql = `
      UPDATE "Brands"
      SET "brandName" = $1
      WHERE "brandId" = $2
      RETURNING *
    `;
    const res = await query(sql, [brandName, id]);
    return res.rows[0];
  }

  static async delete(id) {
    const sql = `DELETE FROM "Brands" WHERE "brandId" = $1 RETURNING *`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
}

export default BrandModel;
