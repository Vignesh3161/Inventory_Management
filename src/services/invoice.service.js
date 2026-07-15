import InvoiceModel from '../models/invoice.model.js';
import BillModel from '../models/bill.model.js';
import BillItemModel from '../models/billItem.model.js';
import SettingModel from '../models/setting.model.js';
import RetailInventoryModel from '../models/retailInventory.model.js';
import RetailStockMovementModel from '../models/retailStockMovement.model.js';
import { generateInvoiceNumber } from '../utils/invoiceNumber.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class InvoiceService {
  static async createInvoice({ billId }) {
    const settings = await SettingModel.getSettings();
    const prefix = settings ? settings.invoicePrefix : 'INV';
    const invoiceNumber = await generateInvoiceNumber(prefix);

    // Create uploads/invoices directory if not exists
    const pdfDir = path.join('src', 'uploads', 'invoices');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfFilename = `invoice-${invoiceNumber}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFilename);
    const pdfUrl = `/uploads/invoices/${pdfFilename}`;

    const invoice = await InvoiceModel.create({
      invoiceNumber,
      billId,
      invoiceStatus: 'Generated',
      pdfUrl
    });

    // Generate PDF in background/async
    this.generatePDF(invoice.invoiceId, pdfPath).catch(err => {
      console.error('Error generating Invoice PDF:', err);
    });

    return invoice;
  }

  static async generatePDF(invoiceId, outputPath) {
    const invoice = await InvoiceModel.findById(invoiceId);
    const bill = await BillModel.findById(invoice.billId);
    const items = await BillItemModel.findByBillId(invoice.billId);
    const settings = await SettingModel.getSettings();

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Shop Header
    doc.fontSize(20).text(settings ? settings.shopName : 'Textile Store', { align: 'center' });
    doc.fontSize(10).text(settings ? settings.shopAddress : '', { align: 'center' });
    doc.text(`GSTIN: ${settings ? settings.shopGST : ''}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('TAX INVOICE', { align: 'center', underline: true });
    doc.moveDown();

    // Invoice Details
    doc.fontSize(10);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 50, 150);
    doc.text(`Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 165);
    doc.text(`Bill Number: ${bill.billNumber}`, 50, 180);

    doc.text(`Customer Name: ${bill.customerName || 'Walk-in Customer'}`, 350, 150);
    doc.text(`Customer Mobile: ${bill.customerMobile || 'N/A'}`, 350, 165);
    doc.moveDown(2);

    // Table Headers
    const tableTop = 220;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 220, tableTop, { width: 30, align: 'right' });
    doc.text('Price', 270, tableTop, { width: 60, align: 'right' });
    doc.text('GST %', 350, tableTop, { width: 40, align: 'right' });
    doc.text('Disc %', 410, tableTop, { width: 40, align: 'right' });
    doc.text('Total', 480, tableTop, { width: 60, align: 'right' });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Items
    let currentHeight = tableTop + 25;
    doc.font('Helvetica');
    for (const item of items) {
      doc.text(item.productName, 50, currentHeight);
      doc.text(item.quantity.toString(), 220, currentHeight, { width: 30, align: 'right' });
      doc.text(parseFloat(item.price).toFixed(2), 270, currentHeight, { width: 60, align: 'right' });
      doc.text(`${item.gst}%`, 350, currentHeight, { width: 40, align: 'right' });
      doc.text(`${item.discount}%`, 410, currentHeight, { width: 40, align: 'right' });
      doc.text(parseFloat(item.total).toFixed(2), 480, currentHeight, { width: 60, align: 'right' });
      currentHeight += 20;
    }

    doc.moveTo(50, currentHeight).lineTo(550, currentHeight).stroke();
    currentHeight += 10;

    // Totals
    doc.text('Subtotal:', 380, currentHeight, { width: 80, align: 'right' });
    doc.text(parseFloat(bill.subtotal).toFixed(2), 480, currentHeight, { width: 60, align: 'right' });
    currentHeight += 15;

    doc.text('Discount:', 380, currentHeight, { width: 80, align: 'right' });
    doc.text(parseFloat(bill.discountAmount).toFixed(2), 480, currentHeight, { width: 60, align: 'right' });
    currentHeight += 15;

    doc.text('GST Amount:', 380, currentHeight, { width: 80, align: 'right' });
    doc.text(parseFloat(bill.gstAmount).toFixed(2), 480, currentHeight, { width: 60, align: 'right' });
    currentHeight += 15;

    doc.font('Helvetica-Bold');
    doc.text('Grand Total:', 380, currentHeight, { width: 80, align: 'right' });
    doc.text(parseFloat(bill.grandTotal).toFixed(2), 480, currentHeight, { width: 60, align: 'right' });

    doc.end();
  }

  static async getInvoiceById(id) {
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found.');
    }
    const items = await BillItemModel.findByBillId(invoice.billId);
    return { ...invoice, items };
  }

  static async getInvoiceByNumber(invoiceNumber) {
    const invoice = await InvoiceModel.findByInvoiceNumber(invoiceNumber);
    if (!invoice) {
      throw new Error('Invoice not found.');
    }
    const items = await BillItemModel.findByBillId(invoice.billId);
    return { ...invoice, items };
  }

  static async getAllInvoices(filters = {}) {
    return await InvoiceModel.findAll(filters);
  }

  static async cancelInvoice(invoiceId, cancellationReason) {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found.');
    }
    if (invoice.invoiceStatus === 'Cancelled') {
      throw new Error('Invoice is already cancelled.');
    }

    // Update status to Cancelled and save the reason
    const updatedInvoice = await InvoiceModel.updateStatusAndReason(invoiceId, 'Cancelled', cancellationReason);

    // Retrieve original purchased items
    const items = await BillItemModel.findByBillId(invoice.billId);

    // Restore stock and log movements
    for (const item of items) {
      await RetailInventoryModel.updateQuantity(item.productId, item.quantity);

      await RetailStockMovementModel.create({
        productId: item.productId,
        movementType: 'Return',
        quantity: item.quantity,
        reason: `Invoice Cancellation: ${cancellationReason || 'N/A'}`
      });
    }

    return updatedInvoice;
  }
}

export default InvoiceService;
