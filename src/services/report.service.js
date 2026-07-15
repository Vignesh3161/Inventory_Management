import { query } from '../config/db.js';

class ReportService {
  static async getDashboardSummary() {
    // Today's Revenue
    const todayRevenueSql = `
      SELECT COALESCE(SUM("totalAmount"), 0)::numeric as "todayRevenue"
      FROM "Sales"
      WHERE DATE("saleDate") = CURRENT_DATE
    `;
    const todayRevenueRes = await query(todayRevenueSql);
    const todayRevenue = parseFloat(todayRevenueRes.rows[0].todayRevenue);

    // Total Revenue
    const totalRevenueSql = `
      SELECT COALESCE(SUM("totalAmount"), 0)::numeric as "totalRevenue"
      FROM "Sales"
    `;
    const totalRevenueRes = await query(totalRevenueSql);
    const totalRevenue = parseFloat(totalRevenueRes.rows[0].totalRevenue);

    // Total Bills
    const totalBillsSql = `
      SELECT COUNT(*)::int as "totalBills"
      FROM "Sales"
    `;
    const totalBillsRes = await query(totalBillsSql);
    const totalBills = totalBillsRes.rows[0].totalBills;

    // Factory Stock
    const factoryStockSql = `
      SELECT COALESCE(SUM("quantity"), 0)::int as "factoryStock"
      FROM "FactoryInventory"
    `;
    const factoryStockRes = await query(factoryStockSql);
    const factoryStock = factoryStockRes.rows[0].factoryStock;

    // Retail Stock
    const retailStockSql = `
      SELECT COALESCE(SUM("quantity"), 0)::int as "retailStock"
      FROM "RetailInventory"
    `;
    const retailStockRes = await query(retailStockSql);
    const retailStock = retailStockRes.rows[0].retailStock;

    // Low Stock Products Count
    const lowStockSql = `
      SELECT COUNT(*)::int as "lowStockCount"
      FROM "RetailInventory"
      WHERE "quantity" <= "minimumStock"
    `;
    const lowStockRes = await query(lowStockSql);
    const lowStockCount = lowStockRes.rows[0].lowStockCount;

    // Best Selling Products
    const bestSellingSql = `
      SELECT p."productName", p."barcode", SUM(bi."quantity")::int as "totalQuantity", SUM(bi."total")::numeric as "totalSales"
      FROM "BillItems" bi
      LEFT JOIN "Products" p ON bi."productId" = p."productId"
      LEFT JOIN "Sales" s ON bi."billId" = s."billId"
      WHERE s."saleId" IS NOT NULL
      GROUP BY p."productId", p."productName", p."barcode"
      ORDER BY "totalQuantity" DESC
      LIMIT 5
    `;
    const bestSellingRes = await query(bestSellingSql);

    return {
      todayRevenue,
      totalRevenue,
      totalBills,
      factoryStock,
      retailStock,
      lowStockCount,
      bestSellingProducts: bestSellingRes.rows.map(r => ({
        productName: r.productName,
        barcode: r.barcode,
        quantitySold: r.totalQuantity || 0,
        revenue: parseFloat(r.totalSales || 0)
      }))
    };
  }

  static async getSalesReport({ filter, startDate, endDate }) {
    let start = null;
    let end = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'today') {
      start = today.toISOString();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      end = tomorrow.toISOString();
    } else if (filter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      start = yesterday.toISOString();
      end = today.toISOString();
    } else if (filter === 'last7days') {
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 7);
      start = last7.toISOString();
    } else if (filter === 'last30days') {
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 30);
      start = last30.toISOString();
    } else if (filter === 'monthly') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = firstDay.toISOString();
    } else if (filter === 'yearly') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      start = firstDay.toISOString();
    } else if (startDate && endDate) {
      start = new Date(startDate).toISOString();
      end = new Date(endDate).toISOString();
    }

    let sql = `
      SELECT s.*, b."billNumber", i."invoiceNumber", u."name" as "cashierName"
      FROM "Sales" s
      LEFT JOIN "Bills" b ON s."billId" = b."billId"
      LEFT JOIN "Invoices" i ON s."invoiceId" = i."invoiceId"
      LEFT JOIN "Users" u ON b."userId" = u."userId"
    `;
    const params = [];
    let paramIndex = 1;

    if (start && end) {
      sql += ` WHERE s."saleDate" >= $${paramIndex} AND s."saleDate" < $${paramIndex + 1}`;
      params.push(start, end);
      paramIndex += 2;
    } else if (start) {
      sql += ` WHERE s."saleDate" >= $${paramIndex}`;
      params.push(start);
      paramIndex += 1;
    }

    sql += ` ORDER BY s."saleDate" DESC`;
    const res = await query(sql, params);

    const totalSalesCount = res.rows.length;
    const totalRevenue = res.rows.reduce((sum, row) => sum + parseFloat(row.totalAmount || 0), 0);

    return {
      totalSalesCount,
      totalRevenue,
      sales: res.rows
    };
  }

  static async getInventoryReport() {
    const sql = `
      SELECT 
        (SELECT COALESCE(SUM("quantity"), 0) FROM "FactoryInventory")::int as "totalFactoryStock",
        (SELECT COALESCE(SUM("quantity"), 0) FROM "RetailInventory")::int as "totalRetailStock",
        (SELECT COUNT(*) FROM "Products")::int as "totalProducts",
        COALESCE(SUM((COALESCE(f."quantity", 0) + COALESCE(r."quantity", 0)) * p."mrp"), 0)::numeric as "currentStockValue"
      FROM "Products" p
      LEFT JOIN "FactoryInventory" f ON p."productId" = f."productId"
      LEFT JOIN "RetailInventory" r ON p."productId" = r."productId"
    `;
    const res = await query(sql);
    const row = res.rows[0] || { totalFactoryStock: 0, totalRetailStock: 0, totalProducts: 0, currentStockValue: 0 };
    return {
      totalFactoryStock: row.totalFactoryStock,
      totalRetailStock: row.totalRetailStock,
      totalProducts: row.totalProducts,
      currentStockValue: parseFloat(row.currentStockValue || 0)
    };
  }

  static async getFactoryInventoryReport() {
    const stockSql = `SELECT COALESCE(SUM("quantity"), 0)::int as "currentFactoryStock" FROM "FactoryInventory"`;
    const stockRes = await query(stockSql);
    const currentFactoryStock = stockRes.rows[0].currentFactoryStock;

    const recentSql = `
      SELECT m.*, p."productName", p."barcode"
      FROM "FactoryStockMovements" m
      JOIN "Products" p ON m."productId" = p."productId"
      WHERE m."movementType" = 'Production'
      ORDER BY m."createdAt" DESC
      LIMIT 10
    `;
    const recentRes = await query(recentSql);

    const movementsSql = `
      SELECT m.*, p."productName", p."barcode"
      FROM "FactoryStockMovements" m
      JOIN "Products" p ON m."productId" = p."productId"
      ORDER BY m."createdAt" DESC
      LIMIT 20
    `;
    const movementsRes = await query(movementsSql);

    return {
      currentFactoryStock,
      recentlyProduced: recentRes.rows,
      movements: movementsRes.rows
    };
  }

  static async getRetailInventoryReport() {
    const stockSql = `SELECT COALESCE(SUM("quantity"), 0)::int as "availableRetailStock" FROM "RetailInventory"`;
    const stockRes = await query(stockSql);
    const availableRetailStock = stockRes.rows[0].availableRetailStock;

    const recentSql = `
      SELECT bi.*, p."productName", p."barcode", b."createdAt"
      FROM "BillItems" bi
      JOIN "Bills" b ON bi."billId" = b."billId"
      JOIN "Products" p ON bi."productId" = p."productId"
      JOIN "Sales" s ON b."billId" = s."billId"
      ORDER BY b."createdAt" DESC
      LIMIT 10
    `;
    const recentRes = await query(recentSql);

    const summarySql = `
      SELECT r.*, p."productName", p."barcode"
      FROM "RetailInventory" r
      JOIN "Products" p ON r."productId" = p."productId"
      ORDER BY r."quantity" ASC
    `;
    const summaryRes = await query(summarySql);

    return {
      availableRetailStock,
      recentlySoldProducts: recentRes.rows,
      retailStockSummary: summaryRes.rows
    };
  }

  static async getStockTransferReport() {
    const transfersSql = `
      SELECT t.*, p."productName", p."barcode", u."name" as "transferredByName"
      FROM "StockTransfers" t
      JOIN "Products" p ON t."productId" = p."productId"
      LEFT JOIN "Users" u ON t."transferredBy" = u."userId"
      WHERE t."toLocation" = 'Retail'
      ORDER BY t."transferDate" DESC
    `;
    const transfersRes = await query(transfersSql);

    const onlineSql = `
      SELECT m.*, p."productName", p."barcode"
      FROM "FactoryStockMovements" m
      JOIN "Products" p ON m."productId" = p."productId"
      WHERE m."movementType" = 'Transfer to Online'
      ORDER BY m."createdAt" DESC
    `;
    const onlineRes = await query(onlineSql);

    return {
      transfers: transfersRes.rows,
      onlineDispatches: onlineRes.rows
    };
  }

  static async getGSTReport() {
    const totalGSTSql = `
      SELECT COALESCE(SUM(b."gstAmount"), 0)::numeric as "totalGSTCollected"
      FROM "Bills" b
      JOIN "Sales" s ON b."billId" = s."billId"
    `;
    const totalGSTRes = await query(totalGSTSql);
    const totalGSTCollected = parseFloat(totalGSTRes.rows[0].totalGSTCollected);

    const breakdownSql = `
      SELECT 
        p."gst" as "gstRate",
        COALESCE(SUM(bi."quantity"), 0)::int as "itemsSold",
        COALESCE(SUM(bi."price" * bi."quantity" * (bi."gst"/100.0)), 0)::numeric as "gstCollected"
      FROM "BillItems" bi
      JOIN "Products" p ON bi."productId" = p."productId"
      JOIN "Sales" s ON bi."billId" = s."billId"
      GROUP BY p."gst"
      ORDER BY p."gst" ASC
    `;
    const breakdownRes = await query(breakdownSql);

    const invoiceSql = `
      SELECT i."invoiceNumber", b."gstAmount"::numeric, i."createdAt"
      FROM "Invoices" i
      JOIN "Bills" b ON i."billId" = b."billId"
      ORDER BY i."createdAt" DESC
      LIMIT 20
    `;
    const invoiceRes = await query(invoiceSql);

    const dateSql = `
      SELECT DATE(i."createdAt") as "date", COALESCE(SUM(b."gstAmount"), 0)::numeric as "gstCollected"
      FROM "Invoices" i
      JOIN "Bills" b ON i."billId" = b."billId"
      GROUP BY DATE(i."createdAt")
      ORDER BY "date" DESC
      LIMIT 30
    `;
    const dateRes = await query(dateSql);

    return {
      totalGSTCollected,
      gstRateBreakdown: breakdownRes.rows.map(r => ({
        gstRate: parseFloat(r.gstRate),
        itemsSold: r.itemsSold,
        gstCollected: parseFloat(r.gstCollected)
      })),
      invoiceGSTList: invoiceRes.rows.map(r => ({
        invoiceNumber: r.invoiceNumber,
        gstAmount: parseFloat(r.gstAmount),
        createdAt: r.createdAt
      })),
      dateGSTList: dateRes.rows.map(r => ({
        date: r.date,
        gstCollected: parseFloat(r.gstCollected)
      }))
    };
  }

  static async getProfitReport() {
    // Fetch total revenue
    const revenueSql = `SELECT COALESCE(SUM("totalAmount"), 0)::numeric as "revenue" FROM "Sales"`;
    const res = await query(revenueSql);
    const revenue = parseFloat(res.rows[0].revenue);

    return {
      message: "Profit calculation cannot be completed accurately because product cost is unavailable.",
      revenue,
      productCost: null,
      grossProfit: null,
      profitPercentage: null
    };
  }

  static async getLowStockReport() {
    const sql = `
      SELECT r."quantity" as "currentStock", r."minimumStock", p."productName", p."barcode"
      FROM "RetailInventory" r
      JOIN "Products" p ON r."productId" = p."productId"
      WHERE r."quantity" <= r."minimumStock"
      ORDER BY r."quantity" ASC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      productName: r.productName,
      barcode: r.barcode,
      currentStock: r.currentStock,
      minimumStock: r.minimumStock
    }));
  }

  static async getBestSellingProducts() {
    const sql = `
      SELECT p."productName", p."barcode", COALESCE(SUM(bi."quantity"), 0)::int as "quantitySold", COALESCE(SUM(bi."total"), 0)::numeric as "revenue"
      FROM "BillItems" bi
      JOIN "Products" p ON bi."productId" = p."productId"
      JOIN "Sales" s ON bi."billId" = s."billId"
      GROUP BY p."productId", p."productName", p."barcode"
      ORDER BY "quantitySold" DESC
      LIMIT 10
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      productName: r.productName,
      barcode: r.barcode,
      quantitySold: r.quantitySold,
      revenue: parseFloat(r.revenue || 0)
    }));
  }
}

export default ReportService;
