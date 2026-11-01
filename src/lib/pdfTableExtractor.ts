/**
 * Advanced PDF table extraction with column clustering and multi-table detection.
 * Handles invoices, bank statements, messy PDFs, and wide tables.
 */
import { pdfjsLib } from "@/lib/pdfWorker";

export interface TextItem {
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
 * Group items into rows by Y-coordinate proximity, comparing each item with
 * the row's running centre so slightly offset baselines stay together.
 */
function groupIntoRows(items: TextItem[]): Map<number, TextItem[]> {
  const sortedItems = [...items].sort((a, b) => a.y - b.y); // top to bottom (y grows downward)
  const heights = items.map(it => it.height).filter(h => h > 0).sort((a, b) => a - b);
  const medianHeight = heights.length > 0 ? heights[Math.floor(heights.length / 2)] : 10;
  const yTolerance = Math.max(medianHeight * 0.45, 2.5);
  const groups: { y: number; items: TextItem[] }[] = [];
  for (const item of sortedItems) {
    const g = groups.find(gr => Math.abs(item.y - gr.y) <= yTolerance);
    if (g) {
      g.items.push(item);
      g.y = g.items.reduce((sum, it) => sum + it.y, 0) / g.items.length;
    } else groups.push({ y: item.y, items: [item] });
  }
  const rows = new Map<number, TextItem[]>();
  for (const g of groups) rows.set(g.y, g.items);
  return rows;
}

/**
 * Find column bands from the horizontal space actually covered by text in
 * multi-cell rows. Gaps that no row writes into become column separators, so
 * right-aligned amounts and left-aligned labels land in the correct column.
 */
function projectColumns(rows: TextItem[][]): { start: number; end: number }[] {
  const multi = rows.filter(r => r.length >= 2);
  if (multi.length < 2) return [];
  const spans = multi.flat().map(it => ({ start: it.x, end: it.x + Math.max(it.width, 1) })).sort((a, b) => a.start - b.start);
  const bands: { start: number; end: number }[] = [];
  for (const sp of spans) {
    const last = bands[bands.length - 1];
    if (last && sp.start <= last.end + 2) last.end = Math.max(last.end, sp.end);
    else bands.push({ ...sp });
  }
  return bands;
}

function bandIndex(item: TextItem, bands: { start: number; end: number }[]): number {
  const centre = item.x + item.width / 2;
  let best = 0, bestDist = Infinity;
  bands.forEach((b, i) => {
    const d = centre < b.start ? b.start - centre : centre > b.end ? centre - b.end : 0;
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
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
function dropEmptyColumns(rows: string[][]): string[][] {
  if (!rows.length) return rows;
  const keep = rows[0].map((_, i) => rows.some(r => (r[i] || "").trim()));
  return rows.map(r => r.filter((_, i) => keep[i]));
}

export function extractPageData(items: TextItem[]): string[][] {
  if (items.length === 0) return [];

  // Group into rows
  const rowMap = groupIntoRows(items);
  const sortedYKeys = [...rowMap.keys()].sort((a, b) => a - b); // top of page first

  // Merge adjacent items within each row
  for (const key of sortedYKeys) {
    rowMap.set(key, mergeAdjacentItems(rowMap.get(key)!));
  }

  const rowsList = sortedYKeys.map(key => rowMap.get(key)!);
  const bands = projectColumns(rowsList);
  const result: string[][] = [];

  if (bands.length >= 2) {
    for (const rowItems of rowsList) {
      const cells = new Array(bands.length).fill("");
      for (const item of [...rowItems].sort((p, q) => p.x - q.x)) {
        const idx = bandIndex(item, bands);
        cells[idx] = cells[idx] ? `${cells[idx]} ${item.str.trim()}` : item.str.trim();
      }
      if (cells.some(c => c.trim())) result.push(cells);
    }
    return dropEmptyColumns(result);
  }

  // Fallback for pages without a clear grid: cluster left edges.
  const allMerged: TextItem[] = rowsList.flat();
  const colBoundaries = clusterColumns(allMerged);
  const numCols = colBoundaries.length;
  if (numCols === 0) return [];
  for (const rowItems of rowsList) {
    const cells = new Array(numCols).fill("");
    for (const item of rowItems) {
      const colIdx = getColumnIndex(item.x, colBoundaries);
      cells[colIdx] = cells[colIdx] ? `${cells[colIdx]} ${item.str.trim()}` : item.str.trim();
    }
    if (cells.some(c => c.trim())) result.push(cells);
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
