import ExcelJS from 'exceljs';

/**
 * Read an Excel file and return workbook data
 */
export async function readExcelFile(file: File): Promise<{
  workbook: ExcelJS.Workbook;
  sheetNames: string[];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    // For CSV files, read as text and parse
    const text = await file.text();
    const rows = parseCSV(text);
    const worksheet = workbook.addWorksheet('Sheet1');
    rows.forEach(row => worksheet.addRow(row));
  } else {
    // For xlsx/xls files
    await workbook.xlsx.load(arrayBuffer);
  }
  
  const sheetNames = workbook.worksheets.map(ws => ws.name);
  return { workbook, sheetNames };
}

/**
 * Parse CSV text into rows
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.trim()) {
      const cells: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current.trim());
      rows.push(cells);
    }
  }
  
  return rows;
}

/**
 * Convert sheet data to 2D array
 */
export function sheetToArray(worksheet: ExcelJS.Worksheet): (string | number | boolean | null)[][] {
  const data: (string | number | boolean | null)[][] = [];
  
  worksheet.eachRow((row, rowNumber) => {
    const rowData: (string | number | boolean | null)[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // Pad with nulls if there are gaps
      while (rowData.length < colNumber - 1) {
        rowData.push(null);
      }
      
      const value = cell.value;
      if (value === null || value === undefined) {
        rowData.push(null);
      } else if (typeof value === 'object' && 'result' in value) {
        // Formula result
        rowData.push(value.result?.toString() ?? null);
      } else if (typeof value === 'object' && 'text' in value) {
        // Rich text
        rowData.push(value.text?.toString() ?? null);
      } else if (value instanceof Date) {
        rowData.push(value.toLocaleDateString());
      } else {
        rowData.push(value as string | number | boolean);
      }
    });
    data.push(rowData);
  });
  
  return data;
}

/**
 * Create an Excel workbook from 2D array data
 */
export async function createExcelFromData(
  data: string[][],
  options: {
    sheetName?: string;
    preserveFormatting?: boolean;
  } = {}
): Promise<ArrayBuffer> {
  const { sheetName = 'Extracted Data', preserveFormatting = true } = options;
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'VexaTool';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet(sheetName);
  
  // Normalize data to have consistent column count
  const maxCols = Math.max(...data.map(row => row.length), 1);
  const normalizedData = data.map(row => {
    const newRow = [...row];
    while (newRow.length < maxCols) {
      newRow.push('');
    }
    return newRow;
  });
  
  // Add rows
  normalizedData.forEach(row => {
    worksheet.addRow(row);
  });
  
  // Apply column widths if preserving formatting
  if (preserveFormatting) {
    for (let i = 1; i <= maxCols; i++) {
      const column = worksheet.getColumn(i);
      let maxWidth = 10;
      
      normalizedData.forEach(row => {
        const cellValue = row[i - 1] || '';
        if (cellValue.length > maxWidth) {
          maxWidth = Math.min(cellValue.length, 50);
        }
      });
      
      column.width = maxWidth + 2;
    }
  }
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

/**
 * Get workbook type interface for compatibility
 */
export interface ExcelWorkbook {
  workbook: ExcelJS.Workbook;
  sheetNames: string[];
}
