import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { sendSuccess } from './utils/response.js';

// Import middlewares
import { requestLogger, notFound, errorHandler, authenticate, authorize } from './middleware/index.js';
import { processExchange, processRefund } from './controllers/return.controller.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import brandRoutes from './routes/brand.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import customerRoutes from './routes/customer.routes.js';
import billingRoutes from './routes/billing.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import salesRoutes from './routes/sales.routes.js';
import returnRoutes from './routes/return.routes.js';
import reportRoutes from './routes/report.routes.js';
import settingRoutes from './routes/setting.routes.js';
import barcodeRoutes from './routes/barcode.routes.js';
import factoryInventoryRoutes from './routes/factoryInventory.routes.js';
import retailInventoryRoutes from './routes/retailInventory.routes.js';
import roleRoutes from './routes/role.routes.js';

const expressApp = express();

expressApp.use(cors());
expressApp.use(requestLogger);
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));

// Register routes
expressApp.use('/api/auth', authRoutes);
expressApp.use('/api/users', userRoutes);
expressApp.use('/api/roles', roleRoutes);
expressApp.use('/api/products', productRoutes);
expressApp.use('/api/categories', categoryRoutes);
expressApp.use('/api/brands', brandRoutes);
expressApp.use('/api/inventory', inventoryRoutes);
expressApp.use('/api/stock-transfer', transferRoutes);
expressApp.use('/api/customers', customerRoutes);
expressApp.use('/api/billing', billingRoutes);
expressApp.use('/api/invoices', invoiceRoutes);
expressApp.use('/api/sales', salesRoutes);
expressApp.use('/api/returns', returnRoutes);
expressApp.post('/api/exchanges', authenticate, authorize(['ADMIN', 'STAFF']), processExchange);
expressApp.post('/api/refunds', authenticate, authorize(['ADMIN', 'STAFF']), processRefund);
expressApp.use('/api/reports', reportRoutes);
expressApp.use('/api/settings', settingRoutes);
expressApp.use('/api/barcodes', barcodeRoutes);
expressApp.use('/api/factory-inventory', factoryInventoryRoutes);
expressApp.use('/api/retail-inventory', retailInventoryRoutes);

expressApp.get('/', (req, res) => {
  return sendSuccess(res, 'Welcome to Textile Billing System API');
});

// 404 Handler
expressApp.use(notFound);

// Global Error Handler
expressApp.use(errorHandler);

export default expressApp;
