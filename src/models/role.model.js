import { query } from '../config/db.js';

class RoleModel {
  static async create(roleName) {
    const sql = `INSERT INTO "Roles" ("roleName") VALUES ($1) RETURNING *`;
    const res = await query(sql, [roleName]);
    return res.rows[0];
  }

  static async findAll() {
    const sql = `SELECT * FROM "Roles" ORDER BY "roleId" ASC`;
    const res = await query(sql);
    return res.rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM "Roles" WHERE "roleId" = $1`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findByName(roleName) {
    const sql = `SELECT * FROM "Roles" WHERE "roleName" = $1`;
    const res = await query(sql, [roleName]);
    return res.rows[0] || null;
  }

  static async update(id, roleName) {
    const sql = `UPDATE "Roles" SET "roleName" = $1 WHERE "roleId" = $2 RETURNING *`;
    const res = await query(sql, [roleName, id]);
    return res.rows[0] || null;
  }

  static async delete(id) {
    const sql = `DELETE FROM "Roles" WHERE "roleId" = $1 RETURNING *`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
}

export default RoleModel;
