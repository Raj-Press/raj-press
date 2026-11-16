import { Order } from '../types';
import { formatDDMMYYYY } from './date';

/**
 * Generates and triggers download of an Excel-compatible CSV file.
 * Prepends UTF-8 BOM (\uFEFF) to guarantee Microsoft Excel renders
 * Marathi Devanagari script accurately without font corruption.
 */
export function exportOrdersToCSV(orders: Order[]): void {
  const headers = [
    'Receipt No',
    'Order Date',
    'Party / Customer Name',
    'Mobile No',
    'Job Details',
    'Order Type',
    'Quantity',
    'Primary Paper',
    'Secondary Paper',
    'Paper Size',
    'Binding',
    'Ink Colours',
    'Printing Type',
    'Numbering',
    'Total Amount (₹)',
    'Advance Amount (₹)',
    'Balance Due (₹)',
    'Promise Date',
    'Status',
    'Notes'
  ];

  const rows = orders.map(o => [
    `"${(o.receipt_no || '').replace(/"/g, '""')}"`,
    `"${formatDDMMYYYY(o.order_date)}"`,
    `"${(o.party_name || '').replace(/"/g, '""')}"`,
    `"${(o.party_phone || '').replace(/"/g, '""')}"`,
    `"${(o.job_details || '').replace(/"/g, '""')}"`,
    `"${(o.order_type || 'General').replace(/"/g, '""')}"`,
    o.quantity || 1,
    `"${(o.paper_primary || '').replace(/"/g, '""')}"`,
    `"${(o.paper_secondary || '').replace(/"/g, '""')}"`,
    `"${(o.paper_size || '').replace(/"/g, '""')}"`,
    `"${(o.binding_type || '').replace(/"/g, '""')}"`,
    `"${(o.ink_colours || []).join(', ').replace(/"/g, '""')}"`,
    `"${(o.printing_type || '').replace(/"/g, '""')}"`,
    `"${(o.numbering_range || '').replace(/"/g, '""')}"`,
    o.total_amount || 0,
    o.advance_amount || 0,
    o.balance_due || 0,
    `"${formatDDMMYYYY(o.promise_date)}"`,
    `"${o.status || ''}"`,
    `"${(o.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  
  a.href = url;
  a.download = `Raj_Press_Orders_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete database state as a JSON backup file
 */
export function exportDatabaseJSON(orders: Order[]): void {
  const backup = {
    appName: 'RAJ PRESS ERP',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalOrders: orders.length,
    orders
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];

  a.href = url;
  a.download = `Raj_Press_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
