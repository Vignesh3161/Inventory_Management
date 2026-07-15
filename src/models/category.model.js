import { query } from '../config/db.js';

class CategoryModel {
  static async create(categoryName) {
    const sql = `INSERT INTO "Categories" ("categoryName") VALUES ($1) RETURNING *`;
    const res = await query(sql, [categoryName]);
    return res.rows[0];
  }

  static async findAll() {
    const sql = `SELECT * FROM "Categories" ORDER BY "categoryId" ASC`;
    const res = await query(sql);
    return res.rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM "Categories" WHERE "categoryId" = $1`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findByName(categoryName) {
    const sql = `SELECT * FROM "Categories" WHERE "categoryName" = $1`;
    const res = await query(sql, [categoryName]);
    return res.rows[0] || null;
  }

  static async update(id, categoryName) {
    const sql = `
      UPDATE "Categories"
      SET "categoryName" = $1
      WHERE "categoryId" = $2
      RETURNING *
    `;
    const res = await query(sql, [categoryName, id]);
    return res.rows[0];
  }

  static async delete(id) {
    const sql = `DELETE FROM "Categories" WHERE "categoryId" = $1 RETURNING *`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
}

export default CategoryModel;
