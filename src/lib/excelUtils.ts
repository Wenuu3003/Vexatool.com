import ExcelJS from 'exceljs';

/**
 * Read an Excel file and return workbook data
 */
export async function readExcelFile(file: File): Promise<{
  workbook: ExcelJS.Workbook;
  sheetNames: string[];
}> {
  if (file.name.toLowerCase().endsWith('.xls')) throw new Error('Legacy XLS is unsupported. Save as XLSX or CSV first.');
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
    // Omit unsupported drawings in an in-memory copy for cell-data export.
    const { default: JSZip } = await import('jszip');
    const zip = await JSZip.loadAsync(arrayBuffer);
    for (const name of Object.keys(zip.files)) {
      if (name.startsWith('xl/drawings/')) zip.remove(name);
    }
    const dataOnly = await zip.generateAsync({ type: 'arraybuffer' });
    await workbook.xlsx.load(dataOnly, { ignoreNodes: ['drawing'] });
  }
  
  const sheetNames = workbook.worksheets.map(ws => ws.name);
  return { workbook, sheetNames };
}

/**
 * Parse CSV text into rows
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  const finishRow = () => { row.push(cell); if (row.some(value => value.length)) rows.push(row); row = []; cell = ''; };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      finishRow();
    } else cell += ch;
  }
  if (quoted) throw new Error('Unclosed quoted CSV field.');
  if (cell.length || row.length) finishRow();
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
      } else if (typeof value === 'object' && 'richText' in value) {
        rowData.push(value.richText.map(run => run.text).join(''));
      } else if (typeof value === 'object' && ('formula' in value || 'sharedFormula' in value)) {
        // Formula result
        rowData.push(value.result === undefined ? '[Formula result unavailable]' : String(value.result));
      } else if (typeof value === 'object' && 'text' in value) {
        // Rich text
        rowData.push(value.text?.toString() ?? null);
      } else if (value instanceof Date) {
        rowData.push(value.toLocaleDateString());
      } else if (typeof value === 'object' && 'error' in value) {
        rowData.push(value.error);
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
