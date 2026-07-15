import { query } from '../config/db.js';

class UserModel {
  static async create({ name, password, roleId, phone, status = 'Active' }) {
    const sql = `
      INSERT INTO "Users" ("name", "password", "roleId", "phone", "status")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await query(sql, [name, password, roleId, phone, status]);
    return res.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT u.*, r."roleName" 
      FROM "Users" u
      LEFT JOIN "Roles" r ON u."roleId" = r."roleId"
      WHERE u."userId" = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findByName(name) {
    const sql = `
      SELECT u.*, r."roleName"
      FROM "Users" u
      LEFT JOIN "Roles" r ON u."roleId" = r."roleId"
      WHERE u."name" = $1
    `;
    const res = await query(sql, [name]);
    return res.rows[0] || null;
  }

  static async findAll() {
    const sql = `
      SELECT u.*, r."roleName"
      FROM "Users" u
      LEFT JOIN "Roles" r ON u."roleId" = r."roleId"
      ORDER BY u."userId" ASC
    `;
    const res = await query(sql);
    return res.rows;
  }

  static async getRoleIdByName(roleName) {
    if (!roleName) return null;
    const normalized = roleName.toUpperCase().replace(/\s+/g, '_');
    const sql = `SELECT "roleId" FROM "Roles" WHERE UPPER(REPLACE("roleName", ' ', '_')) = $1`;
    const res = await query(sql, [normalized]);
    return res.rows[0] ? res.rows[0].roleId : null;
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
      UPDATE "Users"
      SET ${setClause.join(', ')}
      WHERE "userId" = $${i}
      RETURNING *
    `;
    const res = await query(sql, values);
    return res.rows[0];
  }

  static async delete(id) {
    const sql = `DELETE FROM "Users" WHERE "userId" = $1 RETURNING *`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
}

export default UserModel;
