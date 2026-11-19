import {
  AlignmentType, BorderStyle, Document, ImageRun, Packer, Paragraph, SectionType, Table, TableCell, TableRow,
  TextRun, WidthType, type ISectionOptions,
} from 'docx';
import { pdfjsLib, withPdfWorkerFallback } from './pdfWorker';

/** A positioned text run from the PDF, in PDF points with y measured from the page top. */
export interface WordTextItem { x: number; y: number; width: number; size: number; text: string; bold?: boolean }
export interface WordPdfPage { width: number; height: number; image: Uint8Array; text: string; items?: WordTextItem[] }

interface Cell { x: number; end: number; size: number; runs: WordTextItem[] }
interface Line { y: number; size: number; cells: Cell[] }

const MARGIN = 36; // 0.5in page margin in points
const tw = (pt: number) => Math.max(0, Math.round(pt * 20));

/** Group items into lines (by baseline) and lines into cells (split at wide horizontal gaps). */
export function groupLines(items: WordTextItem[]): Line[] {
  const sorted = items.filter(i => i.text.trim() || i.text === ' ').sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: { y: number; size: number; items: WordTextItem[] }[] = [];
  for (const item of sorted) {
    const line = lines.find(l => Math.abs(l.y - item.y) <= Math.max(2, Math.min(l.size, item.size) * 0.45));
    if (line) { line.items.push(item); line.size = Math.max(line.size, item.size); }
    else lines.push({ y: item.y, size: item.size, items: [item] });
  }
  return lines.sort((a, b) => a.y - b.y).map(line => {
    const cells: Cell[] = [];
    for (const item of line.items.sort((a, b) => a.x - b.x)) {
      const last = cells[cells.length - 1];
      if (last && item.x - last.end < Math.max(item.size, last.size) * 1.2) {
        last.runs.push(item); last.end = Math.max(last.end, item.x + item.width);
      } else cells.push({ x: item.x, end: item.x + item.width, size: item.size, runs: [item] });
    }
    return { y: line.y, size: line.size, cells };
  });
}

function runsFor(cell: Cell): TextRun[] {
  const runs: TextRun[] = [];
  let prevEnd: number | undefined;
  for (const r of cell.runs) {
    let text = r.text;
    if (prevEnd !== undefined && r.x - prevEnd > r.size * 0.15 && !/^\s/.test(text)) text = ' ' + text;
    runs.push(new TextRun({ text, bold: r.bold, size: Math.max(12, Math.round(r.size * 2)), font: 'Arial' }));
    prevEnd = r.x + r.width;
  }
  return runs;
}

/** Find column starts shared across a block of multi-cell lines. */
function columnStarts(block: Line[]): number[] {
  const xs = block.flatMap(l => l.cells.map(c => c.x)).sort((a, b) => a - b);
  const cols: number[] = [];
  for (const x of xs) if (!cols.length || x - cols[cols.length - 1] > 12) cols.push(x);
  return cols;
}

function buildTable(block: Line[], contentWidth: number): Table {
  const cols = columnStarts(block);
  const edges = [...cols.slice(1), MARGIN + contentWidth];
  const widths = cols.map((c, i) => Math.max(400, tw(edges[i] - Math.max(MARGIN, i === 0 ? MARGIN : c))));
  const border = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: block.map(line => {
      const slots: Cell[][] = cols.map(() => []);
      for (const cell of line.cells) {
        let idx = 0;
        for (let i = 0; i < cols.length; i++) if (cell.x >= cols[i] - 6) idx = i;
        slots[idx].push(cell);
      }
      return new TableRow({
        children: slots.map((cells, i) => new TableCell({
          borders, width: { size: widths[i], type: WidthType.DXA },
          margins: { top: 30, bottom: 30, left: 60, right: 60 },
          children: [new Paragraph({ children: cells.flatMap((c, j) => j ? [new TextRun(' '), ...runsFor(c)] : runsFor(c)) })],
        })),
      });
    }),
  });
}

/** Rebuild a text page as editable Word content: positioned paragraphs plus real tables. */
export function layoutPage(items: WordTextItem[], pageWidth: number): (Paragraph | Table)[] {
  const lines = groupLines(items);
  const contentWidth = pageWidth - MARGIN * 2;
  const out: (Paragraph | Table)[] = [];
  let prevBottom = MARGIN;
  for (let i = 0; i < lines.length;) {
    if (lines[i].cells.length >= 3) {
      let j = i;
      while (j < lines.length && (lines[j].cells.length >= 2 || (j > i && lines[j].y - lines[j - 1].y < lines[j].size * 2.2 && lines[j].cells[0].x > lines[i].cells[0].x + 20))) j++;
      // Fold wrapped single-cell continuation lines into the row above.
      const block: Line[] = [];
      for (const line of lines.slice(i, j)) {
        if (line.cells.length < 2 && block.length) block[block.length - 1].cells.push(...line.cells.map(c => ({ ...c, x: c.x })));
        else block.push({ ...line, cells: [...line.cells] });
      }
      if (block.length >= 2) {
        out.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [] }));
        out.push(buildTable(block, contentWidth));
        prevBottom = lines[j - 1].y + lines[j - 1].size * 0.3;
        i = j; continue;
      }
    }
    const line = lines[i];
    const gap = line.y - line.size - prevBottom;
    const first = line.cells[0];
    const lineWidth = line.cells[line.cells.length - 1].end - first.x;
    const center = Math.abs((first.x + lineWidth / 2) - pageWidth / 2) < 15 && first.x > MARGIN + 40;
    const children: TextRun[] = [];
    line.cells.forEach((cell, k) => { if (k) children.push(new TextRun({ text: '\t' })); children.push(...runsFor(cell)); });
    out.push(new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      indent: center ? undefined : { left: tw(first.x - MARGIN) },
      tabStops: line.cells.slice(1).map(c => ({ type: 'left' as const, position: tw(c.x - first.x) })),
      spacing: { before: tw(Math.min(Math.max(gap, 0), 72)), after: 0, line: Math.round(line.size * 1.15 * 20), lineRule: 'atLeast' as const },
      children,
    }));
    prevBottom = line.y + line.size * 0.3;
    i++;
  }
  return out;
}

/**
 * One Word section per PDF page. Text pages are rebuilt as editable paragraphs and tables at their
 * original positions and font sizes; scanned pages without text keep the rendered page image.
 */
export function buildPdfWordDocument(pages: WordPdfPage[]) {
  const sections: ISectionOptions[] = pages.map(page => {
    const size = { width: Math.round(page.width * 20), height: Math.round(page.height * 20) };
    if (page.text.trim()) {
      const children = page.items?.length
        ? layoutPage(page.items, page.width)
        : page.text.split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line, font: 'Arial', size: 20 })] }));
      return {
        properties: { type: SectionType.NEXT_PAGE, page: { size, margin: { top: tw(MARGIN), bottom: tw(MARGIN), left: tw(MARGIN), right: tw(MARGIN), header: 0, footer: 0 } } },
        children,
      };
    }
    return {
      properties: { type: SectionType.NEXT_PAGE, page: { size, margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 } } },
      children: [new Paragraph({
        spacing: { before: 0, after: 0, line: 1 },
        children: [new ImageRun({ type: 'png', data: page.image,
          transformation: { width: page.width * 96 / 72, height: page.height * 96 / 72 },
          floating: { horizontalPosition: { relative: 'page', offset: 0 }, verticalPosition: { relative: 'page', offset: 0 },
            behindDocument: true, allowOverlap: true },
          altText: { title: 'Scanned PDF page', description: 'Scanned page kept as an image (no text found).', name: 'PDF page' },
        })],
      })],
    };
  });
  return new Document({ sections });
}

export async function convertPdfToWord(file: File, onProgress: (value: number) => void) {
  const bytes = await file.arrayBuffer();
  const pdf = await withPdfWorkerFallback(() => pdfjsLib.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise);
  try {
    const pages: WordPdfPage[] = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const dimensions = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const styles = content.styles as Record<string, { fontFamily?: string }>;
      const items: WordTextItem[] = [];
      for (const item of content.items) {
        if (!('str' in item) || !item.str) continue;
        const [a, b, c, d, e, f] = pdfjsLib.Util.transform(dimensions.transform, item.transform);
        const size = Math.hypot(c, d) || Math.hypot(a, b) || 10;
        const font = `${item.fontName} ${styles[item.fontName]?.fontFamily ?? ''}`;
        items.push({ x: e, y: f, width: item.width, size, text: item.str, bold: /bold|black|heavy/i.test(font) });
      }
      const text = groupLines(items).map(l => l.cells.map(c => c.runs.map(r => r.text).join(' ')).join('  ')).join('\n').trim();
      let image = new Uint8Array();
      if (!text) {
        const scale = Math.min(1.5, Math.sqrt(8000000 / (dimensions.width * dimensions.height)));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Page rendering is unavailable in this browser.');
        await page.render({ canvasContext: context, viewport, background: 'white' }).promise;
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(v => v ? resolve(v) : reject(new Error('Could not render PDF page.')), 'image/png'));
        image = new Uint8Array(await blob.arrayBuffer());
        canvas.width = 0; canvas.height = 0;
      }
      pages.push({ width: dimensions.width, height: dimensions.height, image, text, items });
      page.cleanup();
      onProgress(Math.round(number / pdf.numPages * 80));
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    onProgress(90);
    return { blob: await Packer.toBlob(buildPdfWordDocument(pages)), pageCount: pages.length, preview: pages.map(p => p.text).join('\n\n') };
  } finally { await pdf.destroy(); }
}
