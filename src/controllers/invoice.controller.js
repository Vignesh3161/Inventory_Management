import InvoiceService from '../services/invoice.service.js';
import { sendSuccess } from '../utils/response.js';
import path from 'path';
import fs from 'fs';

export const createInvoice = async (req, res, next) => {
  try {
    const { billId } = req.body;
    const invoice = await InvoiceService.createInvoice({ billId });
    return sendSuccess(res, 'Invoice created successfully.', {
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.invoiceStatus
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await InvoiceService.getInvoiceById(req.params.id);
    return sendSuccess(res, 'Invoice retrieved successfully.', invoice);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceByNumber = async (req, res, next) => {
  try {
    const invoice = await InvoiceService.getInvoiceByNumber(req.params.invoiceNumber);
    return sendSuccess(res, 'Invoice retrieved successfully.', invoice);
  } catch (error) {
    next(error);
  }
};

export const getAllInvoices = async (req, res, next) => {
  try {
    const { startDate, endDate, customerId, invoiceNumber, limit, offset } = req.query;
    const invoices = await InvoiceService.getAllInvoices({
      startDate,
      endDate,
      customerId,
      invoiceNumber,
      limit,
      offset
    });
    return sendSuccess(res, 'Invoices retrieved successfully.', invoices);
  } catch (error) {
    next(error);
  }
};

export const cancelInvoice = async (req, res, next) => {
  try {
    const { reason } = req.body;
    await InvoiceService.cancelInvoice(req.params.id, reason);
    return sendSuccess(res, 'Invoice cancelled successfully.');
  } catch (error) {
    next(error);
  }
};

export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await InvoiceService.getInvoiceById(req.params.id);
    const pdfFilename = `invoice-${invoice.invoiceNumber}.pdf`;
    const pdfFilePath = path.resolve('src', 'uploads', 'invoices', pdfFilename);

    if (!fs.existsSync(pdfFilePath)) {
      await InvoiceService.generatePDF(invoice.invoiceId, pdfFilePath);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${pdfFilename}`);
    return res.sendFile(pdfFilePath);
  } catch (error) {
    next(error);
  }
};
