-- ==========================================
-- Database Schema for Textile Billing System
-- PostgreSQL / Neon DB
-- ==========================================

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS "Roles" (
  "roleId" SERIAL PRIMARY KEY,
  "roleName" VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS "Users" (
  "userId" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "roleId" INT REFERENCES "Roles"("roleId") ON DELETE RESTRICT,
  "phone" VARCHAR(20),
  "status" VARCHAR(20) DEFAULT 'Active',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS "Categories" (
  "categoryId" SERIAL PRIMARY KEY,
  "categoryName" VARCHAR(100) UNIQUE NOT NULL
);

-- 4. Brands Table
CREATE TABLE IF NOT EXISTS "Brands" (
  "brandId" SERIAL PRIMARY KEY,
  "brandName" VARCHAR(100) UNIQUE NOT NULL
);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS "Products" (
  "productId" SERIAL PRIMARY KEY,
  "barcode" VARCHAR(100) UNIQUE NOT NULL,
  "productName" VARCHAR(150) NOT NULL,
  "categoryId" INT REFERENCES "Categories"("categoryId") ON DELETE RESTRICT,
  "brandId" INT REFERENCES "Brands"("brandId") ON DELETE RESTRICT,
  "size" VARCHAR(20) NOT NULL,
  "color" VARCHAR(50) NOT NULL,
  "mrp" NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  "gst" NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  "discount" NUMERIC(5, 2) DEFAULT 0.00,
  "image" VARCHAR(255),
  "status" VARCHAR(20) DEFAULT 'Active',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Factory Inventory Table
CREATE TABLE IF NOT EXISTS "FactoryInventory" (
  "inventoryId" SERIAL PRIMARY KEY,
  "productId" INT REFERENCES "Products"("productId") ON DELETE CASCADE,
  "quantity" INT NOT NULL DEFAULT 0,
  "lastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Retail Inventory Table
CREATE TABLE IF NOT EXISTS "RetailInventory" (
  "inventoryId" SERIAL PRIMARY KEY,
  "productId" INT REFERENCES "Products"("productId") ON DELETE CASCADE,
  "quantity" INT NOT NULL DEFAULT 0,
  "minimumStock" INT DEFAULT 5,
  "lastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Stock Transfers Table
CREATE TABLE IF NOT EXISTS "StockTransfers" (
  "transferId" SERIAL PRIMARY KEY,
  "productId" INT REFERENCES "Products"("productId") ON DELETE RESTRICT,
  "fromLocation" VARCHAR(100) NOT NULL,
  "toLocation" VARCHAR(100) NOT NULL,
  "quantity" INT NOT NULL,
  "transferDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "transferredBy" INT REFERENCES "Users"("userId") ON DELETE SET NULL,
  "status" VARCHAR(50) DEFAULT 'Completed'
);

-- 8a. Factory Stock Movements Table
CREATE TABLE IF NOT EXISTS "FactoryStockMovements" (
  "movementId" SERIAL PRIMARY KEY,
  "productId" INT REFERENCES "Products"("productId") ON DELETE CASCADE,
  "movementType" VARCHAR(50) NOT NULL, -- 'Production', 'Transfer to Retail', 'Transfer to Online', 'Adjustment', 'Damage'
  "quantity" INT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_factory_movements_product ON "FactoryStockMovements"("productId");

-- 8b. Retail Stock Movements Table
CREATE TABLE IF NOT EXISTS "RetailStockMovements" (
  "movementId" SERIAL PRIMARY KEY,
  "productId" INT REFERENCES "Products"("productId") ON DELETE CASCADE,
  "movementType" VARCHAR(50) NOT NULL, -- 'Stock Received', 'Customer Sale', 'Return', 'Adjustment', 'Damage'
  "quantity" INT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_retail_movements_product ON "RetailStockMovements"("productId");

-- 9. Customers Table
CREATE TABLE IF NOT EXISTS "Customers" (
  "customerId" SERIAL PRIMARY KEY,
  "customerName" VARCHAR(100),
  "mobile" VARCHAR(20) UNIQUE NOT NULL,
  "status" VARCHAR(20) DEFAULT 'Active',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Bills Table
CREATE TABLE IF NOT EXISTS "Bills" (
  "billId" SERIAL PRIMARY KEY,
  "billNumber" VARCHAR(100) UNIQUE NOT NULL,
  "customerId" INT REFERENCES "Customers"("customerId") ON DELETE SET NULL,
  "userId" INT REFERENCES "Users"("userId") ON DELETE RESTRICT,
  "subtotal" NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  "gstAmount" NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  "discountAmount" NUMERIC(12, 2) DEFAULT 0.00,
  "grandTotal" NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  "paymentMethod" VARCHAR(50) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Bill Items Table
CREATE TABLE IF NOT EXISTS "BillItems" (
  "billItemId" SERIAL PRIMARY KEY,
  "billId" INT REFERENCES "Bills"("billId") ON DELETE CASCADE,
  "productId" INT REFERENCES "Products"("productId") ON DELETE RESTRICT,
  "quantity" INT NOT NULL,
  "price" NUMERIC(10, 2) NOT NULL,
  "gst" NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  "discount" NUMERIC(5, 2) DEFAULT 0.00,
  "total" NUMERIC(12, 2) NOT NULL
);

-- 12. Invoices Table
CREATE TABLE IF NOT EXISTS "Invoices" (
  "invoiceId" SERIAL PRIMARY KEY,
  "invoiceNumber" VARCHAR(100) UNIQUE NOT NULL,
  "billId" INT REFERENCES "Bills"("billId") ON DELETE CASCADE,
  "invoiceStatus" VARCHAR(50) DEFAULT 'Paid',
  "pdfUrl" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "cancellationReason" TEXT
);

-- 13. Sales Table
CREATE TABLE IF NOT EXISTS "Sales" (
  "saleId" SERIAL PRIMARY KEY,
  "billId" INT REFERENCES "Bills"("billId") ON DELETE CASCADE,
  "invoiceId" INT REFERENCES "Invoices"("invoiceId") ON DELETE CASCADE,
  "totalAmount" NUMERIC(12, 2) NOT NULL,
  "paymentMethod" VARCHAR(50) NOT NULL,
  "saleDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Returns Table
CREATE TABLE IF NOT EXISTS "Returns" (
  "returnId" SERIAL PRIMARY KEY,
  "invoiceId" INT REFERENCES "Invoices"("invoiceId") ON DELETE RESTRICT,
  "productId" INT REFERENCES "Products"("productId") ON DELETE RESTRICT,
  "quantity" INT NOT NULL,
  "refundAmount" NUMERIC(12, 2) NOT NULL,
  "returnReason" TEXT,
  "status" VARCHAR(50) DEFAULT 'Pending',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "refundMethod" VARCHAR(50),
  "refundDate" TIMESTAMP,
  "type" VARCHAR(20) DEFAULT 'Return',
  "exchangedProductId" INT REFERENCES "Products"("productId") ON DELETE RESTRICT,
  "priceDifference" NUMERIC(12, 2)
);

-- 15. Settings Table
CREATE TABLE IF NOT EXISTS "Settings" (
  "settingId" SERIAL PRIMARY KEY,
  "gst" NUMERIC(5, 2) DEFAULT 0.00,
  "invoicePrefix" VARCHAR(20) DEFAULT 'INV',
  "defaultDiscount" NUMERIC(5, 2) DEFAULT 0.00,
  "shopName" VARCHAR(100),
  "shopAddress" TEXT,
  "shopGST" VARCHAR(50)
);

-- 16. Draft Bills Table (Cart)
CREATE TABLE IF NOT EXISTS "DraftBills" (
  "draftBillId" SERIAL PRIMARY KEY,
  "userId" INT REFERENCES "Users"("userId") ON DELETE CASCADE,
  "customerId" INT REFERENCES "Customers"("customerId") ON DELETE SET NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Draft Bill Items Table
CREATE TABLE IF NOT EXISTS "DraftBillItems" (
  "draftItemId" SERIAL PRIMARY KEY,
  "draftBillId" INT REFERENCES "DraftBills"("draftBillId") ON DELETE CASCADE,
  "productId" INT REFERENCES "Products"("productId") ON DELETE CASCADE,
  "quantity" INT NOT NULL DEFAULT 1
);

-- ==========================================
-- Indexing Strategy
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_barcode ON "Products"("barcode");
CREATE INDEX IF NOT EXISTS idx_products_name ON "Products"("productName");
CREATE INDEX IF NOT EXISTS idx_bills_number ON "Bills"("billNumber");
CREATE INDEX IF NOT EXISTS idx_invoices_number ON "Invoices"("invoiceNumber");
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON "Customers"("mobile");
CREATE INDEX IF NOT EXISTS idx_customers_email ON "Customers"("email");
CREATE INDEX IF NOT EXISTS idx_sales_date ON "Sales"("saleDate");
CREATE INDEX IF NOT EXISTS idx_transfers_date ON "StockTransfers"("transferDate");

-- ==========================================
-- Triggers for updatedAt
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON "Users";
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON "Users" 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON "Products";
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON "Products" 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();
