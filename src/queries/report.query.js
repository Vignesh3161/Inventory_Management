export default {
  dashboardSummary: `
    SELECT 
      (SELECT COALESCE(SUM("totalAmount"), 0) FROM "Sales") as "totalRevenue",
      (SELECT COUNT(*) FROM "Sales") as "totalSalesCount",
      (SELECT COUNT(*) FROM "Products") as "totalProductsCount",
      (SELECT COUNT(*) FROM "RetailInventory" WHERE "quantity" <= "minimumStock") as "lowStockCount"
  `,
  bestSellingProducts: `
    SELECT p."productName", p."barcode", SUM(bi."quantity") as "totalQuantity", SUM(bi."total") as "totalSales"
    FROM "BillItems" bi
    LEFT JOIN "Products" p ON bi."productId" = p."productId"
    GROUP BY p."productId", p."productName", p."barcode"
    ORDER BY "totalQuantity" DESC
    LIMIT 10
  `
};
