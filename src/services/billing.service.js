import BillModel from '../models/bill.model.js';
import BillItemModel from '../models/billItem.model.js';
import RetailInventoryModel from '../models/retailInventory.model.js';
import ProductModel from '../models/product.model.js';
import { generateBillNumber } from '../utils/billNumber.js';
import InvoiceService from './invoice.service.js';
import SalesService from './sales.service.js';
import RetailStockMovementModel from '../models/retailStockMovement.model.js';
import SettingModel from '../models/setting.model.js';

class BillingService {
  static async scanBarcode(barcode) {
    if (!barcode) {
      throw new Error('Barcode is required.');
    }
    const product = await ProductModel.findByBarcode(barcode);
    if (!product) {
      throw new Error('Product not found.');
    }
    return {
      productId: product.productId,
      productName: product.productName,
      price: parseFloat(product.mrp),
      gst: parseFloat(product.gst),
      discount: parseFloat(product.discount || 0)
    };
  }

  static async searchProducts(searchQuery) {
    if (!searchQuery) {
      return [];
    }
    const products = await ProductModel.queryProducts({ search: searchQuery });
    return products.map(product => ({
      productId: product.productId,
      productName: product.productName,
      price: parseFloat(product.mrp),
      gst: parseFloat(product.gst),
      discount: parseFloat(product.discount || 0)
    }));
  }

  static async addDraftItem({ userId, productId, quantity }) {
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }
    const product = await ProductModel.findById(productId);
    if (!product || product.status !== 'Active') {
      throw new Error('Product is not active or does not exist.');
    }

    // Check retail inventory stock
    const retailInv = await RetailInventoryModel.findByProductId(productId);
    const available = retailInv ? retailInv.quantity : 0;
    if (available < quantity) {
      throw new Error(`Insufficient Stock. Available: ${available}`);
    }

    let draftBill = await BillModel.findActiveDraftByUserId(userId);
    if (!draftBill) {
      draftBill = await BillModel.createDraft({ userId });
    }

    const item = await BillItemModel.addDraftItem({
      draftBillId: draftBill.draftBillId,
      productId,
      quantity
    });

    return item;
  }

  static async updateDraftItemQuantity(draftItemId, quantity) {
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }
    const draftItem = await BillItemModel.findDraftItemById(draftItemId);
    if (!draftItem) {
      throw new Error('Item not found in current draft bill.');
    }

    // Check retail stock
    const retailInv = await RetailInventoryModel.findByProductId(draftItem.productId);
    const available = retailInv ? retailInv.quantity : 0;
    if (available < quantity) {
      throw new Error(`Insufficient Stock. Available: ${available}`);
    }

    return await BillItemModel.updateDraftItemQuantity(draftItemId, quantity);
  }

  static async removeDraftItem(draftItemId) {
    const item = await BillItemModel.removeDraftItem(draftItemId);
    if (!item) {
      throw new Error('Item not found.');
    }
    return item;
  }

  static async generateBillFromDraft({ userId, customerId = null }) {
    const draftBill = await BillModel.findActiveDraftByUserId(userId);
    if (!draftBill) {
      throw new Error('No active draft bill found for this user.');
    }

    const draftItems = await BillItemModel.findDraftItemsByDraftBillId(draftBill.draftBillId);
    if (draftItems.length === 0) {
      throw new Error('Draft bill is empty.');
    }

    const settings = await SettingModel.getSettings();
    const defaultGst = settings ? parseFloat(settings.gst || 0) : 0;
    const defaultDiscount = settings ? parseFloat(settings.defaultDiscount || 0) : 0;

    let subtotal = 0;
    let gstAmount = 0;
    let discountAmount = 0;

    const validatedItems = [];

    for (const item of draftItems) {
      const itemPrice = parseFloat(item.mrp);
      // Priority: Product-specific values if greater than 0; otherwise global defaults.
      const itemGstPct = parseFloat(item.gst) > 0 ? parseFloat(item.gst) : defaultGst;
      const itemDiscountPct = parseFloat(item.discount || 0) > 0 ? parseFloat(item.discount || 0) : defaultDiscount;

      const totalItemPrice = itemPrice * item.quantity;
      const itemDiscount = (totalItemPrice * itemDiscountPct) / 100;
      const discountedTotal = totalItemPrice - itemDiscount;
      const itemGst = (discountedTotal * itemGstPct) / 100;
      const finalItemTotal = discountedTotal + itemGst;

      subtotal += totalItemPrice;
      discountAmount += itemDiscount;
      gstAmount += itemGst;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        gst: itemGstPct,
        discount: itemDiscountPct,
        total: finalItemTotal
      });
    }

    const grandTotal = subtotal - discountAmount + gstAmount;
    const billNumber = generateBillNumber();

    // Create the main bill record (marked Pending Payment)
    const bill = await BillModel.create({
      billNumber,
      customerId: customerId || draftBill.customerId,
      userId,
      subtotal,
      gstAmount,
      discountAmount,
      grandTotal,
      paymentMethod: 'Pending'
    });

    // Create final BillItems
    for (const valItem of validatedItems) {
      await BillItemModel.create({
        billId: bill.billId,
        productId: valItem.productId,
        quantity: valItem.quantity,
        price: valItem.price,
        gst: valItem.gst,
        discount: valItem.discount,
        total: valItem.total
      });
    }

    // Clean up draft bill
    await BillModel.deleteDraft(draftBill.draftBillId);

    return {
      billId: bill.billId,
      billNumber: bill.billNumber,
      grandTotal: parseFloat(bill.grandTotal)
    };
  }

  static async processPayment({ billId, paymentMethod }) {
    const bill = await BillModel.findById(billId);
    if (!bill) {
      throw new Error('Bill not found.');
    }

    const validMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card'];
    if (!validMethods.includes(paymentMethod)) {
      throw new Error('Invalid payment method.');
    }

    // Update payment method
    const updatedBill = await BillModel.updatePaymentMethod(billId, paymentMethod);

    // Retrieve bill items
    const items = await BillItemModel.findByBillId(billId);

    // Reduce stock and log retail stock movements
    for (const item of items) {
      const retailInv = await RetailInventoryModel.findByProductId(item.productId);
      const available = retailInv ? retailInv.quantity : 0;
      if (available < item.quantity) {
        throw new Error(`Insufficient Retail Stock for ${item.productName}. Available: ${available}`);
      }

      await RetailInventoryModel.updateQuantity(item.productId, -item.quantity);

      await RetailStockMovementModel.create({
        productId: item.productId,
        movementType: 'Customer Sale',
        quantity: -item.quantity,
        reason: `Billing Sale - Bill #${updatedBill.billNumber}`
      });
    }

    // Generate invoice & log sale
    const invoice = await InvoiceService.createInvoice({ billId });
    await SalesService.logSale({
      billId,
      invoiceId: invoice.invoiceId,
      totalAmount: parseFloat(updatedBill.grandTotal),
      paymentMethod
    });

    return {
      bill: updatedBill,
      invoice
    };
  }

  // --- Keep original function for legacy compatibility ---
  static async generateBill({ customerId, userId, items, paymentMethod }) {
    let subtotal = 0;
    let gstAmount = 0;
    let discountAmount = 0;

    const validatedItems = [];

    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }

      const retailInv = await RetailInventoryModel.findByProductId(item.productId);
      if (!retailInv || retailInv.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}. Available: ${retailInv ? retailInv.quantity : 0}`);
      }

      const itemPrice = parseFloat(product.mrp);
      const itemGstPct = parseFloat(product.gst);
      const itemDiscountPct = parseFloat(product.discount || 0);

      const totalItemPrice = itemPrice * item.quantity;
      const itemDiscount = (totalItemPrice * itemDiscountPct) / 100;
      const discountedTotal = totalItemPrice - itemDiscount;
      const itemGst = (discountedTotal * itemGstPct) / 100;
      const finalItemTotal = discountedTotal + itemGst;

      subtotal += totalItemPrice;
      discountAmount += itemDiscount;
      gstAmount += itemGst;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        gst: itemGstPct,
        discount: itemDiscountPct,
        total: finalItemTotal
      });
    }

    const grandTotal = subtotal - discountAmount + gstAmount;
    const billNumber = generateBillNumber();

    const bill = await BillModel.create({
      billNumber,
      customerId,
      userId,
      subtotal,
      gstAmount,
      discountAmount,
      grandTotal,
      paymentMethod
    });

    for (const valItem of validatedItems) {
      await BillItemModel.create({
        billId: bill.billId,
        productId: valItem.productId,
        quantity: valItem.quantity,
        price: valItem.price,
        gst: valItem.gst,
        discount: valItem.discount,
        total: valItem.total
      });

      await RetailInventoryModel.updateQuantity(valItem.productId, -valItem.quantity);

      await RetailStockMovementModel.create({
        productId: valItem.productId,
        movementType: 'Customer Sale',
        quantity: -valItem.quantity,
        reason: `Billing Sale - Bill #${billNumber}`
      });
    }

    const invoice = await InvoiceService.createInvoice({ billId: bill.billId });
    await SalesService.logSale({
      billId: bill.billId,
      invoiceId: invoice.invoiceId,
      totalAmount: grandTotal,
      paymentMethod
    });

    return {
      bill,
      invoice
    };
  }

  static async getBillDetails(billId) {
    const bill = await BillModel.findById(billId);
    if (!bill) {
      throw new Error('Bill not found.');
    }
    const items = await BillItemModel.findByBillId(billId);
    return { ...bill, items };
  }
}

export default BillingService;
