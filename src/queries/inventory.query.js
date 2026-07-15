export default {
  findFactoryInventory: `
    SELECT fi.*, p."productName", p."barcode"
    FROM "FactoryInventory" fi
    LEFT JOIN "Products" p ON fi."productId" = p."productId"
    ORDER BY fi."lastUpdated" DESC
  `,
  findRetailInventory: `
    SELECT ri.*, p."productName", p."barcode"
    FROM "RetailInventory" ri
    LEFT JOIN "Products" p ON ri."productId" = p."productId"
    ORDER BY ri."lastUpdated" DESC
  `,
  findLowStock: `
    SELECT ri.*, p."productName", p."barcode"
    FROM "RetailInventory" ri
    LEFT JOIN "Products" p ON ri."productId" = p."productId"
    WHERE ri."quantity" <= ri."minimumStock"
    ORDER BY ri."quantity" ASC
  `
};
