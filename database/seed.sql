-- Seed Initial Roles
INSERT INTO "Roles" ("roleName") 
VALUES ('ADMIN'), ('STOCK_MANAGER'), ('STAFF')
ON CONFLICT ("roleName") DO NOTHING;

-- Seed Initial Categories
INSERT INTO "Categories" ("categoryName") 
VALUES ('Shirt'), ('Jeans'), ('T-Shirt')
ON CONFLICT ("categoryName") DO NOTHING;

-- Seed Initial Brands
INSERT INTO "Brands" ("brandName") 
VALUES ('Allen Solly'), ('Peter England')
ON CONFLICT ("brandName") DO NOTHING;

-- Seed Initial Settings
INSERT INTO "Settings" ("gst", "invoicePrefix", "defaultDiscount", "shopName", "shopAddress", "shopGST")
VALUES (18.00, 'INV', 0.00, 'Textile Fashion Hub', '123 Main Street, City', 'GSTIN1234567890')
ON CONFLICT ("settingId") DO NOTHING;
