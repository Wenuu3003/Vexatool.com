/**
 * Advanced PDF table extraction with column clustering and multi-table detection.
 * Handles invoices, bank statements, messy PDFs, and wide tables.
 */
import { pdfjsLib } from "@/lib/pdfWorker";

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ExtractedTable {
  headers: string[];
  rows: string[][];
}

export interface ExtractionResult {
  sheets: { name: string; data: string[][] }[];
  isImageOnly: boolean;
  totalTextItems: number;
}

/**
 * Cluster X positions into column boundaries using gap analysis.
 * Adaptive minGap based on average character width.
 */
function clusterColumns(items: TextItem[], minGap?: number): number[] {
  if (items.length === 0) return [];

  // Calculate adaptive gap if not provided
  if (!minGap) {
    const avgCharWidth = items.reduce((sum, it) => {
      const charW = it.str.length > 0 ? it.width / it.str.length : 5;
      return sum + charW;
    }, 0) / items.length;
    minGap = Math.max(avgCharWidth * 1.5, 6);
  }

  const xPositions = [...new Set(items.map(it => Math.round(it.x)))].sort((a, b) => a - b);
  if (xPositions.length <= 1) return xPositions;

  const boundaries: number[] = [xPositions[0]];
  for (let i = 1; i < xPositions.length; i++) {
    if (xPositions[i] - xPositions[i - 1] > minGap) {
      boundaries.push(xPositions[i]);
    }
  }
  return boundaries;
}

/**
 * Assign an item to a column index based on nearest boundary.
 */
function getColumnIndex(x: number, boundaries: number[]): number {
  let best = 0;
  let bestDist = Math.abs(x - boundaries[0]);
  for (let i = 1; i < boundaries.length; i++) {
    const dist = Math.abs(x - boundaries[i]);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

/**
 * Group items into rows by Y-coordinate proximity.
 * Uses adaptive tolerance based on item heights.
 */
function groupIntoRows(items: TextItem[]): Map<number, TextItem[]> {
  const rows = new Map<number, TextItem[]>();
  const sortedItems = [...items].sort((a, b) => b.y - a.y); // top to bottom

  // Adaptive tolerance: half of median item height, minimum 3
  const heights = items.map(it => it.height).filter(h => h > 0).sort((a, b) => a - b);
  const medianHeight = heights.length > 0 ? heights[Math.floor(heights.length / 2)] : 10;
  const yTolerance = Math.max(medianHeight * 0.5, 3);

  for (const item of sortedItems) {
    let matched = false;
    for (const [key, group] of rows) {
      if (Math.abs(item.y - key) <= yTolerance) {
        group.push(item);
        matched = true;
        break;
      }
    }
    if (!matched) {
      rows.set(item.y, [item]);
    }
  }
  return rows;
}

/**
 * Merge adjacent text items on the same row that are very close together.
 * Adaptive gap based on font size.
 */
function mergeAdjacentItems(items: TextItem[]): TextItem[] {
  if (items.length <= 1) return items;
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const merged: TextItem[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = sorted[i];
    const gap = curr.x - (prev.x + prev.width);

    // Adaptive max gap: use height as proxy for font size
    const avgHeight = (prev.height + curr.height) / 2;
    const maxGap = Math.max(avgHeight * 0.4, 3);

    if (gap < maxGap) {
      const space = gap > 0.5 ? " " : "";
      prev.str += space + curr.str;
      prev.width = (curr.x + curr.width) - prev.x;
      prev.height = Math.max(prev.height, curr.height);
    } else {
      merged.push({ ...curr });
    }
  }
  return merged;
}

/**
 * Detect if a set of rows looks like a table (has consistent column structure).
 */
function detectTableRegions(
  rowMap: Map<number, TextItem[]>,
  sortedYKeys: number[]
): { tableRows: number[]; nonTableRows: number[] } {
  const tableRows: number[] = [];
  const nonTableRows: number[] = [];

  // Count items per row
  const itemCounts = sortedYKeys.map(key => rowMap.get(key)!.length);

  // Find the most common item count (≥2) as likely table column count
  const countFreq = new Map<number, number>();
  for (const count of itemCounts) {
    if (count >= 2) {
      countFreq.set(count, (countFreq.get(count) || 0) + 1);
    }
  }

  let dominantCount = 0;
  let dominantFreq = 0;
  for (const [count, freq] of countFreq) {
    if (freq > dominantFreq) {
      dominantCount = count;
      dominantFreq = freq;
    }
  }

  for (let i = 0; i < sortedYKeys.length; i++) {
    const count = itemCounts[i];
    // Allow ±1 column variance from dominant count
    if (dominantCount >= 2 && Math.abs(count - dominantCount) <= 1) {
      tableRows.push(i);
    } else if (count >= 2) {
      tableRows.push(i); // still multi-column
    } else {
      nonTableRows.push(i);
    }
  }

  return { tableRows, nonTableRows };
}

/**
 * Extract structured data from a single PDF page.
 */
function extractPageData(items: TextItem[]): string[][] {
  if (items.length === 0) return [];

  // Group into rows
  const rowMap = groupIntoRows(items);
  const sortedYKeys = [...rowMap.keys()].sort((a, b) => b - a);

  // Merge adjacent items within each row
  for (const key of sortedYKeys) {
    rowMap.set(key, mergeAdjacentItems(rowMap.get(key)!));
  }

  // Collect all merged items for column detection
  const allMerged: TextItem[] = [];
  for (const key of sortedYKeys) {
    allMerged.push(...rowMap.get(key)!);
  }

  // Detect column boundaries
  const colBoundaries = clusterColumns(allMerged);
  const numCols = colBoundaries.length;

  if (numCols === 0) return [];

  // Build structured rows
  const result: string[][] = [];
  for (const yKey of sortedYKeys) {
    const rowItems = rowMap.get(yKey)!;
    const cells = new Array(numCols).fill("");

    for (const item of rowItems) {
      const colIdx = getColumnIndex(item.x, colBoundaries);
      if (cells[colIdx]) {
        cells[colIdx] += " " + item.str.trim();
      } else {
        cells[colIdx] = item.str.trim();
      }
    }

    // Skip completely empty rows
    if (cells.some(c => c.trim())) {
      result.push(cells);
    }
  }

  return result;
}

/**
 * Extract all data from a PDF file with intelligent table detection.
 */
export async function extractPDFToTableData(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const allSheets: { name: string; data: string[][] }[] = [];
  let totalTextItems = 0;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    if (onProgress) onProgress((pageNum / pdf.numPages) * 80);

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    const items: TextItem[] = [];
    for (const item of textContent.items as any[]) {
      if (item.str && item.str.trim()) {
        const charWidth = item.str.length > 0 ? (item.width || item.str.length * 5) / item.str.length : 5;
        items.push({
          str: item.str,
          x: item.transform[4],
          y: viewport.height - item.transform[5],
          width: item.width || (item.str.length * charWidth),
          height: item.height || 10,
        });
      }
    }

    totalTextItems += items.length;
    const pageData = extractPageData(items);

    if (pageData.length > 0) {
      if (pdf.numPages === 1) {
        allSheets.push({ name: "Sheet1", data: pageData });
      } else {
        const lastSheet = allSheets.length > 0 ? allSheets[allSheets.length - 1] : null;
        const lastColCount = lastSheet ? (lastSheet.data[0]?.length ?? 0) : 0;
        const thisColCount = pageData[0]?.length ?? 0;

        if (lastSheet && thisColCount === lastColCount && thisColCount > 1) {
          lastSheet.data.push(...pageData);
        } else {
          allSheets.push({
            name: pdf.numPages > 1 ? `Page ${pageNum}` : "Sheet1",
            data: pageData,
          });
        }
      }
    }

    // Yield to main thread every 5 pages to prevent UI freezing on large files
    if (pageNum % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  if (allSheets.length === 0) {
    allSheets.push({ name: "Sheet1", data: [] });
  }

  const isImageOnly = totalTextItems === 0 && pdf.numPages > 0;

  return { sheets: allSheets, isImageOnly, totalTextItems };
}
