import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { PDFDocument } from 'pdf-lib';
import { toTypedCell } from './spreadsheetCells';
import { extractPageData, type TextItem } from './pdfTableExtractor';
import { convertWorkbookToPdf, formatNumber } from './excelToPdf';

const it_ = (str: string, x: number, y: number, width: number): TextItem => ({ str, x, y, width, height: 10 });

describe('PDF to Excel table extraction', () => {
  it('keeps rows top-to-bottom and right-aligned amounts in their own column', () => {
    const rows = extractPageData([
      it_('Item', 50, 100, 30), it_('Qty', 200, 100, 20), it_('Amount', 320, 100, 40),
      it_('Pen', 50, 115, 20), it_('2', 210, 115, 6), it_('10.00', 335, 115, 25),
      it_('Notebook', 50, 130, 45), it_('12', 206, 130, 10), it_('1,250.50', 320, 130, 40),
    ]);
    expect(rows).toEqual([
      ['Item', 'Qty', 'Amount'],
      ['Pen', '2', '10.00'],
      ['Notebook', '12', '1,250.50'],
    ]);
  });
});

describe('PDF to Excel number cells', () => {
  it('turns amounts into real numbers', () => {
    expect(toTypedCell('1,250.50')).toEqual({ value: 1250.5, numFmt: '#,##0.00' });
    expect(toTypedCell('(300.00)').value).toBe(-300);
    expect(toTypedCell('₹ 1,000').value).toBe(1000);
    expect(toTypedCell('12.5%').value).toBeCloseTo(0.125);
  });
  it('keeps IDs, phone numbers and leading zeros as text', () => {
    expect(toTypedCell('007').value).toBe('007');
    expect(toTypedCell('9876543210123').value).toBe('9876543210123');
    expect(toTypedCell('INV-204').value).toBe('INV-204');
  });
});

describe('Excel to PDF', () => {
  it('formats numbers the way the sheet shows them', () => {
    expect(formatNumber(1234.5, '#,##0.00')).toBe('1,234.50');
    expect(formatNumber(0.256, '0.0%')).toBe('25.6%');
    expect(formatNumber(1234567, '##,##,##0')).toBe('12,34,567');
  });
  it('renders merged, styled and wide sheets without errors and paginates long ones', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Report');
    ws.mergeCells('A1:F1');
    ws.getCell('A1').value = 'Quarterly report';
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    ws.getCell('A1').alignment = { horizontal: 'center' };
    for (let r = 2; r < 200; r++) ws.addRow(['Row ' + r, r * 10.5, 'Hyderabad ₹ – note', r, r, r]);
    ws.getColumn(2).numFmt = '#,##0.00';
    const bytes = await convertWorkbookToPdf(wb, ['Report'], { pageSize: 'a4', orientation: 'portrait', autoFitColumns: true, removeEmptyRows: true, oneSheetPerPage: false });
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThan(2);
  });
  it('fits a sheet onto one page when asked', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('S');
    for (let r = 1; r <= 90; r++) ws.addRow(['A' + r, r]);
    const bytes = await convertWorkbookToPdf(wb, ['S'], { pageSize: 'a4', orientation: 'portrait', autoFitColumns: true, removeEmptyRows: true, oneSheetPerPage: true });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
  });
});
