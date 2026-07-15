export default {
  insertProduct: `
    INSERT INTO "Products" 
    ("barcode", "productName", "categoryId", "brandId", "size", "color", "mrp", "gst", "discount", "image", "status")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `,
  findProductById: `
    SELECT p.*, c."categoryName", b."brandName"
    FROM "Products" p
    LEFT JOIN "Categories" c ON p."categoryId" = c."categoryId"
    LEFT JOIN "Brands" b ON p."brandId" = b."brandId"
    WHERE p."productId" = $1
  `,
  findProductByBarcode: `
    SELECT p.*, c."categoryName", b."brandName"
    FROM "Products" p
    LEFT JOIN "Categories" c ON p."categoryId" = c."categoryId"
    LEFT JOIN "Brands" b ON p."brandId" = b."brandId"
    WHERE p."barcode" = $1
  `,
  findAllProducts: `
    SELECT p.*, c."categoryName", b."brandName"
    FROM "Products" p
    LEFT JOIN "Categories" c ON p."categoryId" = c."categoryId"
    LEFT JOIN "Brands" b ON p."brandId" = b."brandId"
    ORDER BY p."createdAt" DESC
  `
};
