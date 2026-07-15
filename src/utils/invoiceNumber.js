import { query } from '../config/db.js';

export const generateInvoiceNumber = async (prefix = 'INV') => {
  const dateObj = new Date();
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;

  // Query database count of invoices generated today
  const sql = `
    SELECT COUNT(*)::int as count 
    FROM "Invoices" 
    WHERE DATE("createdAt") = CURRENT_DATE
  `;
  const res = await query(sql);
  const nextSeq = (res.rows[0]?.count || 0) + 1;
  const seqStr = String(nextSeq).padStart(4, '0');

  let invoiceNumber = `${prefix}-${dateStr}-${seqStr}`;
  let unique = false;
  let attempts = 0;
  while (!unique && attempts < 10) {
    const checkSql = `SELECT "invoiceId" FROM "Invoices" WHERE "invoiceNumber" = $1`;
    const checkRes = await query(checkSql, [invoiceNumber]);
    if (checkRes.rows.length === 0) {
      unique = true;
    } else {
      attempts++;
      const adjustedSeq = nextSeq + attempts;
      const adjustedSeqStr = String(adjustedSeq).padStart(4, '0');
      invoiceNumber = `${prefix}-${dateStr}-${adjustedSeqStr}`;
    }
  }
  return invoiceNumber;
};
