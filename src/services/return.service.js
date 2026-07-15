import ReturnModel from '../models/return.model.js';
import RetailInventoryModel from '../models/retailInventory.model.js';
import BillItemModel from '../models/billItem.model.js';
import InvoiceModel from '../models/invoice.model.js';
import RetailStockMovementModel from '../models/retailStockMovement.model.js';
import ProductModel from '../models/product.model.js';

class ReturnService {
  static async processReturn({ invoiceNumber, productId, quantity, reason }) {
    // 1. Verify invoice
    const invoice = await InvoiceModel.findByInvoiceNumber(invoiceNumber);
    if (!invoice) {
      throw new Error('Invoice not found.');
    }

    // 2. Verify product (by barcode or productId)
    let product = await ProductModel.findByBarcode(productId);
    if (!product) {
      product = await ProductModel.findById(productId);
    }
    if (!product) {
      throw new Error('Product not found.');
    }

    // 3. Verify if product belongs to invoice's bill
    const items = await BillItemModel.findByBillId(invoice.billId);
    const itemMatch = items.find(item => item.productId === product.productId);
    if (!itemMatch) {
      throw new Error('Product not found in this invoice.');
    }

    // 4. Validate return period (max 30 days)
    const invoiceDate = new Date(invoice.createdAt);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - invoiceDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      throw new Error('Return period exceeded (max 30 days).');
    }

    // 5. Check if quantity exceeds purchased quantity minus already returned
    const alreadyReturned = await ReturnModel.getAlreadyReturnedQuantity(invoice.invoiceId, product.productId);
    if (alreadyReturned + quantity > itemMatch.quantity) {
      throw new Error('Maximum return quantity exceeded.');
    }

    // 6. Calculate refund amount (selling price * quantity, considering GST and discounts)
    const itemTotalPerUnit = parseFloat(itemMatch.total) / itemMatch.quantity;
    const refundAmount = itemTotalPerUnit * quantity;

    // 7. Save return record
    const returnRecord = await ReturnModel.create({
      invoiceId: invoice.invoiceId,
      productId: product.productId,
      quantity,
      refundAmount,
      returnReason: reason,
      status: 'Approved',
      type: 'Return'
    });

    // 8. Restore stock to Retail Inventory
    await RetailInventoryModel.updateQuantity(product.productId, quantity);

    // 9. Log the retail stock movement
    await RetailStockMovementModel.create({
      productId: product.productId,
      movementType: 'Return',
      quantity,
      reason: `Customer Return - Invoice: ${invoice.invoiceNumber}`
    });

    return returnRecord;
  }

  static async processExchange({ invoiceNumber, oldProductId, newProductId, quantity }) {
    // 1. Resolve products
    let oldProduct = await ProductModel.findByBarcode(oldProductId);
    if (!oldProduct) oldProduct = await ProductModel.findById(oldProductId);
    if (!oldProduct) throw new Error('Old product not found.');

    let newProduct = await ProductModel.findByBarcode(newProductId);
    if (!newProduct) newProduct = await ProductModel.findById(newProductId);
    if (!newProduct) throw new Error('New product not found.');

    // 2. Find invoice
    let invoice = null;
    if (invoiceNumber) {
      invoice = await InvoiceModel.findByInvoiceNumber(invoiceNumber);
    } else {
      // Find latest completed invoice containing oldProductId
      const sql = `
        SELECT i.* 
        FROM "Invoices" i
        JOIN "BillItems" bi ON i."billId" = bi."billId"
        WHERE bi."productId" = $1
        ORDER BY i."createdAt" DESC
        LIMIT 1
      `;
      const { query } = await import('../config/db.js');
      const res = await query(sql, [oldProduct.productId]);
      if (res.rows.length > 0) {
        invoice = res.rows[0];
      }
    }

    if (!invoice) {
      throw new Error('Invoice not found or no purchase record exists for the old product.');
    }

    // 3. Verify if old product was in the bill
    const items = await BillItemModel.findByBillId(invoice.billId);
    const oldItemMatch = items.find(item => item.productId === oldProduct.productId);
    if (!oldItemMatch) {
      throw new Error('Old product not found in this invoice.');
    }

    // 4. Check if quantity exceeds allowed returned
    const alreadyReturned = await ReturnModel.getAlreadyReturnedQuantity(invoice.invoiceId, oldProduct.productId);
    if (alreadyReturned + quantity > oldItemMatch.quantity) {
      throw new Error('Maximum return quantity exceeded.');
    }

    // 5. Calculate price difference
    const oldPrice = parseFloat(oldItemMatch.total) / oldItemMatch.quantity;
    const newPrice = parseFloat(newProduct.mrp) * (1 - parseFloat(newProduct.discount || 0)/100) * (1 + parseFloat(newProduct.gst || 0)/100);
    const priceDifference = (newPrice - oldPrice) * quantity;
    const refundAmount = priceDifference < 0 ? Math.abs(priceDifference) : 0;

    // 6. Save exchange record
    const returnRecord = await ReturnModel.create({
      invoiceId: invoice.invoiceId,
      productId: oldProduct.productId,
      quantity,
      refundAmount,
      returnReason: `Exchanged for ${newProduct.productName}`,
      status: 'Exchanged',
      type: 'Exchange',
      exchangedProductId: newProduct.productId,
      priceDifference
    });

    // 7. Restore old product stock
    await RetailInventoryModel.updateQuantity(oldProduct.productId, quantity);

    // 8. Log the retail stock movement for old product
    await RetailStockMovementModel.create({
      productId: oldProduct.productId,
      movementType: 'Return',
      quantity,
      reason: `Customer Exchange (Returned Product) - Invoice: ${invoice.invoiceNumber}`
    });

    // 9. Reduce new product stock
    await RetailInventoryModel.updateQuantity(newProduct.productId, -quantity);

    // 10. Log the retail stock movement for new product
    await RetailStockMovementModel.create({
      productId: newProduct.productId,
      movementType: 'Customer Sale',
      quantity: -quantity,
      reason: `Customer Exchange (New Product) - Invoice: ${invoice.invoiceNumber}`
    });

    return {
      returnRecord,
      priceDifference
    };
  }

  static async processRefund({ returnId, refundMethod }) {
    // Resolve returnId if it has string prefix (like 'RET001')
    const numericId = typeof returnId === 'string' 
      ? parseInt(returnId.replace(/\D/g, '')) 
      : returnId;

    const returnRecord = await ReturnModel.findById(numericId);
    if (!returnRecord) {
      throw new Error('Return record not found.');
    }

    if (returnRecord.status === 'Refunded') {
      throw new Error('Refund has already been completed.');
    }

    const updated = await ReturnModel.updateRefund(numericId, 'Refunded', refundMethod, new Date());
    return updated;
  }

  static async getReturnHistory() {
    return await ReturnModel.findAll();
  }
}

export default ReturnService;
