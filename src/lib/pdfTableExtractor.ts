/**
 * Advanced PDF table extraction with column clustering and multi-table detection.
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

/**
 * Cluster X positions into column boundaries using gap analysis.
 */
function clusterColumns(items: TextItem[], minGap = 8): number[] {
  if (items.length === 0) return [];
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
 */
function groupIntoRows(items: TextItem[], yTolerance = 4): Map<number, TextItem[]> {
  const rows = new Map<number, TextItem[]>();
  const sortedItems = [...items].sort((a, b) => b.y - a.y); // top to bottom

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
 */
function mergeAdjacentItems(items: TextItem[], maxGap = 3): TextItem[] {
  if (items.length <= 1) return items;
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const merged: TextItem[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = sorted[i];
    const gap = curr.x - (prev.x + prev.width);

    if (gap < maxGap) {
      // Merge: append text, extend width
      const space = gap > 0.5 ? " " : "";
      prev.str += space + curr.str;
      prev.width = (curr.x + curr.width) - prev.x;
    } else {
      merged.push({ ...curr });
    }
  }
  return merged;
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
): Promise<{ sheets: { name: string; data: string[][] }[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const allSheets: { name: string; data: string[][] }[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    if (onProgress) onProgress((pageNum / pdf.numPages) * 80);

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    const items: TextItem[] = [];
    for (const item of textContent.items as any[]) {
      if (item.str && item.str.trim()) {
        items.push({
          str: item.str,
          x: item.transform[4],
          y: viewport.height - item.transform[5], // flip Y for top-down
          width: item.width || (item.str.length * 5),
          height: item.height || 10,
        });
      }
    }

    const pageData = extractPageData(items);

    if (pageData.length > 0) {
      if (pdf.numPages === 1) {
        allSheets.push({ name: "Sheet1", data: pageData });
      } else {
        // Check if this page's columns match previous page (same table continues)
        const lastSheet = allSheets.length > 0 ? allSheets[allSheets.length - 1] : null;
        const lastColCount = lastSheet ? (lastSheet.data[0]?.length ?? 0) : 0;
        const thisColCount = pageData[0]?.length ?? 0;

        if (lastSheet && thisColCount === lastColCount && thisColCount > 1) {
          // Same table structure - merge into existing sheet
          lastSheet.data.push(...pageData);
        } else {
          allSheets.push({
            name: pdf.numPages > 1 ? `Page ${pageNum}` : "Sheet1",
            data: pageData,
          });
        }
      }
    }
  }

  // If no data extracted at all, return empty sheet
  if (allSheets.length === 0) {
    allSheets.push({ name: "Sheet1", data: [] });
  }

  return { sheets: allSheets };
}
