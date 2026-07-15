import { query } from '../config/db.js';

class ProductModel {
  static async create({
    barcode,
    productName,
    categoryId,
    brandId,
    size,
    color,
    mrp,
    gst,
    discount = 0.00,
    image,
    status = 'Active'
  }) {
    const sql = `
      INSERT INTO "Products" 
      ("barcode", "productName", "categoryId", "brandId", "size", "color", "mrp", "gst", "discount", "image", "status")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const res = await query(sql, [
      barcode,
      productName,
      categoryId,
      brandId,
      size,
      color,
      mrp,
      gst,
      discount,
      image,
      status
    ]);
    return res.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT p.*, c."categoryName", b."brandName"
      FROM "Products" p
      LEFT JOIN "Categories" c ON p."categoryId" = c."categoryId"
      LEFT JOIN "Brands" b ON p."brandId" = b."brandId"
      WHERE p."productId" = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findByBarcode(barcode) {
    const sql = `
      SELECT p.*, c."categoryName", b."brandName"
      FROM "Products" p
      LEFT JOIN "Categories" c ON p."categoryId" = c."categoryId"
      LEFT JOIN "Brands" b ON p."brandId" = b."brandId"
      WHERE p."barcode" = $1
    `;
    const res = await query(sql, [barcode]);
    return res.rows[0] || null;
  }

  static async findDuplicate({ productName, brandId, size, color }) {
    const sql = `
      SELECT * FROM "Products"
      WHERE LOWER("productName") = LOWER($1)
        AND "brandId" = $2
        AND LOWER("size") = LOWER($3)
        AND LOWER("color") = LOWER($4)
    `;
    const res = await query(sql, [productName, brandId, size, color]);
    return res.rows[0] || null;
  }

  static async getOrCreateCategory(categoryName) {
    const findSql = `SELECT "categoryId" FROM "Categories" WHERE LOWER("categoryName") = LOWER($1)`;
    const findRes = await query(findSql, [categoryName]);
    if (findRes.rows[0]) {
      return findRes.rows[0].categoryId;
    }
    const insertSql = `INSERT INTO "Categories" ("categoryName") VALUES ($1) RETURNING "categoryId"`;
    const insertRes = await query(insertSql, [categoryName]);
    return insertRes.rows[0].categoryId;
  }

  static async getOrCreateBrand(brandName) {
    const findSql = `SELECT "brandId" FROM "Brands" WHERE LOWER("brandName") = LOWER($1)`;
    const findRes = await query(findSql, [brandName]);
    if (findRes.rows[0]) {
      return findRes.rows[0].brandId;
    }
    const insertSql = `INSERT INTO "Brands" ("brandName") VALUES ($1) RETURNING "brandId"`;
    const insertRes = await query(insertSql, [brandName]);
    return insertRes.rows[0].brandId;
  }

  static async queryProducts({
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    brand,
    category,
    size,
    color,
    minPrice,
    maxPrice,
    status,
    search
  }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    let baseQuery = `
      SELECT p.*, c."categoryName", b."brandName"
      FROM "Products" p
      LEFT JOIN "Categories" c ON p."categoryId" = c."categoryId"
      LEFT JOIN "Brands" b ON p."brandId" = b."brandId"
    `;

    if (brand) {
      conditions.push(`b."brandName" ILIKE $${paramIndex}`);
      values.push(brand);
      paramIndex++;
    }

    if (category) {
      conditions.push(`c."categoryName" ILIKE $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (size) {
      conditions.push(`p."size" = $${paramIndex}`);
      values.push(size);
      paramIndex++;
    }

    if (color) {
      conditions.push(`p."color" ILIKE $${paramIndex}`);
      values.push(color);
      paramIndex++;
    }

    if (minPrice !== undefined && minPrice !== null) {
      conditions.push(`p."mrp" >= $${paramIndex}`);
      values.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      conditions.push(`p."mrp" <= $${paramIndex}`);
      values.push(maxPrice);
      paramIndex++;
    }

    if (status) {
      conditions.push(`p."status" = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(
        p."productName" ILIKE $${paramIndex} OR 
        p."barcode" ILIKE $${paramIndex} OR 
        b."brandName" ILIKE $${paramIndex} OR 
        c."categoryName" ILIKE $${paramIndex}
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const allowedSortFields = {
      productName: 'p."productName"',
      brandName: 'b."brandName"',
      categoryName: 'c."categoryName"',
      mrp: 'p."mrp"',
      createdAt: 'p."createdAt"',
    };
    const sortColumn = allowedSortFields[sortBy] || 'p."createdAt"';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    baseQuery += ` ORDER BY ${sortColumn} ${order}`;

    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const res = await query(baseQuery, values);
    return res.rows;
  }

  static async countProducts({
    brand,
    category,
    size,
    color,
    minPrice,
    maxPrice,
    status,
    search
  }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    let baseQuery = `
      SELECT COUNT(*)::int as count
      FROM "Products" p
      LEFT JOIN "Categories" c ON p."categoryId" = c."categoryId"
      LEFT JOIN "Brands" b ON p."brandId" = b."brandId"
    `;

    if (brand) {
      conditions.push(`b."brandName" ILIKE $${paramIndex}`);
      values.push(brand);
      paramIndex++;
    }

    if (category) {
      conditions.push(`c."categoryName" ILIKE $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (size) {
      conditions.push(`p."size" = $${paramIndex}`);
      values.push(size);
      paramIndex++;
    }

    if (color) {
      conditions.push(`p."color" ILIKE $${paramIndex}`);
      values.push(color);
      paramIndex++;
    }

    if (minPrice !== undefined && minPrice !== null) {
      conditions.push(`p."mrp" >= $${paramIndex}`);
      values.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      conditions.push(`p."mrp" <= $${paramIndex}`);
      values.push(maxPrice);
      paramIndex++;
    }

    if (status) {
      conditions.push(`p."status" = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(
        p."productName" ILIKE $${paramIndex} OR 
        p."barcode" ILIKE $${paramIndex} OR 
        b."brandName" ILIKE $${paramIndex} OR 
        c."categoryName" ILIKE $${paramIndex}
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const res = await query(baseQuery, values);
    return res.rows[0].count;
  }

  static async findAll() {
    const sql = `
      SELECT p.*, c."categoryName", b."brandName"
      FROM "Products" p
      LEFT JOIN "Categories" c ON p."categoryId" = c."categoryId"
      LEFT JOIN "Brands" b ON p."brandId" = b."brandId"
      ORDER BY p."createdAt" DESC
    `;
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
      UPDATE "Products"
      SET ${setClause.join(', ')}
      WHERE "productId" = $${i}
      RETURNING *
    `;
    const res = await query(sql, values);
    return res.rows[0];
  }

  static async delete(id) {
    const sql = `DELETE FROM "Products" WHERE "productId" = $1 RETURNING *`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
}

export default ProductModel;
