export default {
  insertBill: `
    INSERT INTO "Bills" 
    ("billNumber", "customerId", "userId", "subtotal", "gstAmount", "discountAmount", "grandTotal", "paymentMethod")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,
  insertBillItem: `
    INSERT INTO "BillItems" ("billId", "productId", "quantity", "price", "gst", "discount", "total")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `
};
