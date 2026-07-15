export default {
  insertSale: `
    INSERT INTO "Sales" ("billId", "invoiceId", "totalAmount", "paymentMethod")
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
  findSalesReport: `
    SELECT s.*, b."billNumber", i."invoiceNumber"
    FROM "Sales" s
    LEFT JOIN "Bills" b ON s."billId" = b."billId"
    LEFT JOIN "Invoices" i ON s."invoiceId" = i."invoiceId"
    WHERE s."saleDate" >= $1 AND s."saleDate" <= $2
    ORDER BY s."saleDate" DESC
  `
};
