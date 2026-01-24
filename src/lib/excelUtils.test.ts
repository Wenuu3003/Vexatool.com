import { describe, it, expect } from 'vitest';
import { createExcelFromData } from './excelUtils';
import ExcelJS from 'exceljs';

// Helper to get buffer length regardless of type (ArrayBuffer or Node Buffer)
const getBufferLength = (buffer: ArrayBuffer | { length: number }): number => {
  if ('byteLength' in buffer) {
    return buffer.byteLength;
  }
  return (buffer as { length: number }).length;
};

describe('excelUtils', () => {
  describe('createExcelFromData', () => {
    it('should create an Excel buffer from 2D array data', async () => {
      const data = [
        ['Name', 'Age', 'City'],
        ['Alice', '30', 'New York'],
        ['Bob', '25', 'Los Angeles'],
      ];

      const buffer = await createExcelFromData(data);
      
      expect(buffer).toBeDefined();
      expect(getBufferLength(buffer)).toBeGreaterThan(0);
    });

    it('should handle empty data', async () => {
      const data: string[][] = [];
      
      const buffer = await createExcelFromData(data);
      
      expect(buffer).toBeDefined();
    });

    it('should handle single row data', async () => {
      const data = [['Header1', 'Header2', 'Header3']];
      
      const buffer = await createExcelFromData(data);
      
      expect(buffer).toBeDefined();
      expect(getBufferLength(buffer)).toBeGreaterThan(0);
    });

    it('should normalize rows with different column counts', async () => {
      const data = [
        ['A', 'B', 'C'],
        ['D'], // Short row
        ['E', 'F', 'G', 'H'], // Long row
      ];

      const buffer = await createExcelFromData(data);
      
      expect(buffer).toBeDefined();
      expect(getBufferLength(buffer)).toBeGreaterThan(0);
    });

    it('should use custom sheet name when provided', async () => {
      const data = [['Test', 'Data']];
      
      const buffer = await createExcelFromData(data, { sheetName: 'Custom Sheet' });
      
      // Verify the buffer can be read back
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.getWorksheet('Custom Sheet');
      expect(worksheet).toBeDefined();
    });

    it('should preserve data correctly when read back', async () => {
      const data = [
        ['Name', 'Value'],
        ['Item1', '100'],
        ['Item2', '200'],
      ];

      const buffer = await createExcelFromData(data);
      
      // Read back the data
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets[0];
      expect(worksheet).toBeDefined();
      
      // Check first row
      const row1 = worksheet.getRow(1);
      expect(row1.getCell(1).value).toBe('Name');
      expect(row1.getCell(2).value).toBe('Value');
      
      // Check second row
      const row2 = worksheet.getRow(2);
      expect(row2.getCell(1).value).toBe('Item1');
      expect(row2.getCell(2).value).toBe('100');
    });

    it('should handle special characters', async () => {
      const data = [
        ['Special', 'Characters'],
        ['Hello "World"', "It's a test"],
        ['Price: $100', 'Discount: 20%'],
      ];

      const buffer = await createExcelFromData(data);
      
      expect(buffer).toBeDefined();
      expect(getBufferLength(buffer)).toBeGreaterThan(0);
      
      // Verify data integrity
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets[0];
      const row2 = worksheet.getRow(2);
      expect(row2.getCell(1).value).toBe('Hello "World"');
    });

    it('should apply column widths when preserveFormatting is true', async () => {
      const data = [
        ['Short', 'This is a much longer header text'],
        ['A', 'B'],
      ];

      const buffer = await createExcelFromData(data, { preserveFormatting: true });
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets[0];
      const col1 = worksheet.getColumn(1);
      const col2 = worksheet.getColumn(2);
      
      // Column 2 should be wider than column 1
      expect(col2.width).toBeGreaterThan(col1.width || 0);
    });

    it('should handle unicode characters', async () => {
      const data = [
        ['日本語', '中文', 'العربية'],
        ['Emoji 🎉', 'Symbols ★', 'Accents éàü'],
      ];

      const buffer = await createExcelFromData(data);
      
      expect(buffer).toBeDefined();
      
      // Verify unicode preservation
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets[0];
      const row1 = worksheet.getRow(1);
      expect(row1.getCell(1).value).toBe('日本語');
    });

    it('should handle numbers and booleans in data', async () => {
      const data = [
        ['String', 'Number', 'Boolean'],
        ['text', '42', 'true'],
        ['more', '3.14', 'false'],
      ];

      const buffer = await createExcelFromData(data);
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets[0];
      expect(worksheet.rowCount).toBeGreaterThanOrEqual(3);
    });
  });
});
