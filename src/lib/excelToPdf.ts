/**
 * Excel → PDF renderer (local, pdf-lib). Keeps the sheet's look: column widths,
 * row heights, merged cells, fills, borders, bold/italic/colour text, alignment
 * and common number formats. Text stays real (selectable) PDF text.
 */
import ExcelJS from 'exceljs';
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from 'pdf-lib';
import { wrapOfficeText } from './officeText';

export interface ExcelPdfOptions {
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  autoFitColumns: boolean;
  removeEmptyRows: boolean;
  oneSheetPerPage: boolean;
  onProgress?: (p: number) => void;
}

type Fonts = { regular: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont };
type Merge = { r1: number; c1: number; r2: number; c2: number };

const MARGIN = 36;
const PAD = 3;
const BASE_FONT = 9;

function colIndex(letters: string): number {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}
function parseRange(ref: string): Merge | null {
  const m = ref.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return null;
  return { c1: colIndex(m[1]), r1: +m[2], c2: colIndex(m[3]), r2: +m[4] };
}

export function argbToRgb(argb?: string): RGB | undefined {
  if (!argb || !/^[0-9A-Fa-f]{6,8}$/.test(argb)) return undefined;
  const hex = argb.length === 8 ? argb.slice(2) : argb;
  return rgb(parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255);
}

/** Format a cell value roughly the way Excel displays it. */
export function formatCellValue(cell: Pick<ExcelJS.Cell, 'value' | 'numFmt'>): string {
  let v: unknown = cell.value;
  if (v === null || v === undefined) return '';
  if (typeof v === 'object' && v !== null) {
    const o = v as Record<string, unknown>;
    if ('richText' in o) return (o.richText as { text: string }[]).map(r => r.text).join('');
    if ('formula' in o || 'sharedFormula' in o) v = o.result ?? '';
    else if ('hyperlink' in o) return String(o.text ?? o.hyperlink ?? '');
    else if ('error' in o) return String(o.error);
    if (v && typeof v === 'object' && 'error' in (v as object)) return String((v as { error: string }).error);
  }
  if (v instanceof Date) {
    const fmt = (cell.numFmt || '').toLowerCase();
    const day = String(v.getUTCDate()).padStart(2, '0'), mon = String(v.getUTCMonth() + 1).padStart(2, '0'), yr = v.getUTCFullYear();
    if (/h|ss/.test(fmt) && !/^[dmy\/\-. ]+$/.test(fmt)) return `${day}-${mon}-${yr} ${String(v.getUTCHours()).padStart(2, '0')}:${String(v.getUTCMinutes()).padStart(2, '0')}`;
    if (fmt.startsWith('m')) return `${mon}/${day}/${yr}`;
    return `${day}-${mon}-${yr}`;
  }
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return formatNumber(v, cell.numFmt);
  return String(v);
}

export function formatNumber(n: number, numFmt?: string): string {
  const fmt = (numFmt || '').split(';')[0];
  if (!fmt || fmt === 'General') return Number.isInteger(n) ? String(n) : String(Math.round(n * 1e10) / 1e10);
  const dec = (fmt.match(/\.(0+)/)?.[1] || '').length;
  const percent = fmt.includes('%');
  const value = percent ? n * 100 : n;
  const neg = value < 0 && (numFmt || '').includes('(');
  let body = Math.abs(value).toFixed(dec);
  if (fmt.includes(',')) {
    const [i, d] = body.split('.');
    body = (fmt.includes('##,##,##0') ? i.replace(/(\d)(?=(\d\d)+\d$)/g, '$1,') : i.replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + (d ? '.' + d : '');
  }
  const symbol = fmt.match(/"([^"]+)"|\[\$([^\]-]+)/);
  const sym = symbol ? (symbol[1] ?? symbol[2]) : fmt.includes('$') ? '$' : fmt.includes('₹') ? '₹' : '';
  const out = `${sym}${body}${percent ? '%' : ''}`;
  return neg ? `(${out})` : value < 0 ? `-${out}` : out;
}

/** Standard PDF fonts only cover Latin text; swap anything else for a safe stand-in. */
function safeText(text: string, font: PDFFont): string {
  const set = new Set(font.getCharacterSet());
  let out = '';
  for (const ch of text.replace(/\t/g, ' ')) {
    const cp = ch.codePointAt(0)!;
    if (set.has(cp) || ch === '\n') out += ch;
    else if (ch === '₹') out += 'Rs.';
    else if (/[\u2018\u2019]/.test(ch)) out += "'";
    else if (/[\u201C\u201D]/.test(ch)) out += '"';
    else if (/[\u2013\u2014]/.test(ch)) out += '-';
    else out += '?';
  }
  return out;
}

interface Layout {
  rows: number[];
  cols: number[];
  colW: number[];
  rowH: number[];
  scale: number;
  merges: Map<string, Merge>;
  covered: Set<string>;
}

export async function convertWorkbookToPdf(wb: ExcelJS.Workbook, sheetNames: string[], opts: ExcelPdfOptions): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
  };
  let done = 0;
  for (const name of sheetNames) {
    const ws = wb.getWorksheet(name);
    if (ws) renderSheet(pdf, ws, fonts, opts);
    done++;
    opts.onProgress?.((done / sheetNames.length) * 100);
  }
  if (!pdf.getPageCount()) throw new Error('No non-empty sheets selected.');
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    const label = `Page ${i + 1} of ${pages.length}`;
    p.drawText(label, { x: p.getWidth() - MARGIN - fonts.regular.widthOfTextAtSize(label, 7), y: 16, size: 7, font: fonts.regular, color: rgb(0.45, 0.45, 0.45) });
  });
  return pdf.save();
}

function renderSheet(pdf: PDFDocument, ws: ExcelJS.Worksheet, fonts: Fonts, opts: ExcelPdfOptions) {
  // Used range (cells with a value or a fill).
  let maxRow = 0, maxCol = 0;
  ws.eachRow({ includeEmpty: false }, (row, r) => {
    row.eachCell({ includeEmpty: false }, (cell, c) => {
      if (formatCellValue(cell).trim() !== '') { maxRow = Math.max(maxRow, r); maxCol = Math.max(maxCol, c); }
    });
  });
  if (!maxRow) return;

  const merges = new Map<string, Merge>();
  const covered = new Set<string>();
  for (const ref of ((ws.model as unknown as { merges?: string[] }).merges || [])) {
    const m = parseRange(ref);
    if (!m) continue;
    merges.set(`${m.r1}:${m.c1}`, m);
    for (let r = m.r1; r <= m.r2; r++) for (let c = m.c1; c <= m.c2; c++) if (r !== m.r1 || c !== m.c1) covered.add(`${r}:${c}`);
    maxCol = Math.max(maxCol, Math.min(m.c2, maxCol + 0)); // never widen past used data
  }

  const rowHasValue = (r: number) => {
    for (let c = 1; c <= maxCol; c++) if (formatCellValue(ws.getCell(r, c)).trim()) return true;
    return false;
  };
  const rows: number[] = [];
  for (let r = 1; r <= maxRow; r++) {
    if (ws.getRow(r).hidden) continue;
    if (opts.removeEmptyRows && !rowHasValue(r) && ![...covered].some(k => k.startsWith(`${r}:`))) continue;
    rows.push(r);
  }
  const cols: number[] = [];
  for (let c = 1; c <= maxCol; c++) if (!ws.getColumn(c).hidden) cols.push(c);
  if (cols.length > 80) throw new Error('This sheet has more than 80 visible columns. Split it into smaller sheets first.');

  let orientation = opts.orientation;
  const naturalW = cols.map(c => naturalColWidth(ws, c, rows, fonts, opts.autoFitColumns));
  const totalNatural = naturalW.reduce((a, b) => a + b, 0);
  const pw = (o: string) => (opts.pageSize === 'a4' ? (o === 'portrait' ? 595 : 842) : o === 'portrait' ? 612 : 792);
  if (orientation === 'portrait' && totalNatural > pw('portrait') - MARGIN * 2) orientation = 'landscape';
  const pageW = pw(orientation);
  const pageH = opts.pageSize === 'a4' ? (orientation === 'portrait' ? 842 : 595) : orientation === 'portrait' ? 792 : 612;
  const availW = pageW - MARGIN * 2;
  const availH = pageH - MARGIN * 2 - 20;

  let scale = Math.min(1, availW / totalNatural);
  const layout = (s: number): Layout => {
    const colW = naturalW.map(w => w * s);
    const colPos = new Map(cols.map((c, i) => [c, i]));
    const rowH = rows.map(r => {
      const explicit = ws.getRow(r).height;
      let h = (explicit ? explicit : 15) * s;
      for (const c of cols) {
        const key = `${r}:${c}`;
        if (covered.has(key)) continue;
        const m = merges.get(key);
        if (m && m.r2 > m.r1) continue; // vertical merges sized by their rows
        let w = colW[colPos.get(c)!];
        if (m) for (let cc = m.c1 + 1; cc <= m.c2; cc++) w += colPos.has(cc) ? colW[colPos.get(cc)!] : 0;
        const text = formatCellValue(ws.getCell(r, c));
        if (!text) continue;
        const { font, size } = cellFont(ws.getCell(r, c), fonts, s);
        const pad = PAD * Math.min(1, s);
        const lines = wrapCell(text, font, size, w - pad * 2);
        h = Math.max(h, lines.length * size * 1.2 + pad * 2);
      }
      return h;
    });
    return { rows, cols, colW, rowH, scale: s, merges, covered };
  };
  let lay = layout(scale);
  if (opts.oneSheetPerPage) {
    for (let tries = 0; tries < 8; tries++) {
      const total = lay.rowH.reduce((a, b) => a + b, 0) + 22;
      if (total <= availH || scale <= 0.3) break;
      scale = Math.max(scale * Math.min(0.95, availH / total), 0.3);
      lay = layout(scale);
    }
  }
  drawSheet(pdf, ws, fonts, lay, { pageW, pageH, availH });
}

function naturalColWidth(ws: ExcelJS.Worksheet, c: number, rows: number[], fonts: Fonts, autoFit: boolean): number {
  const chars = ws.getColumn(c).width ?? 8.43;
  const sheetWidth = Math.max(chars * 5.6 + 4, 14);
  if (!autoFit) return sheetWidth;
  let w = 24;
  for (const r of rows) {
    const cell = ws.getCell(r, c);
    if (cell.isMerged && cell.master.address !== cell.address) continue;
    const text = formatCellValue(cell);
    if (!text) continue;
    const { font, size } = cellFont(cell, fonts, 1);
    const longest = Math.max(...text.split('\n').map(l => font.widthOfTextAtSize(safeText(l.slice(0, 60), font), size)));
    w = Math.max(w, Math.min(longest + PAD * 2 + 2, 220));
  }
  return Math.max(w, Math.min(sheetWidth, 220));
}

function cellFont(cell: ExcelJS.Cell, fonts: Fonts, scale: number) {
  const f = cell.font || {};
  const font = f.bold && f.italic ? fonts.boldItalic : f.bold ? fonts.bold : f.italic ? fonts.italic : fonts.regular;
  const size = Math.max(4, (f.size ? (f.size / 11) * BASE_FONT : BASE_FONT) * scale);
  return { font, size };
}

function wrapCell(text: string, font: PDFFont, size: number, width: number): string[] {
  return text.split('\n').flatMap(part => wrapOfficeText(safeText(part, font), Math.max(1, width), v => font.widthOfTextAtSize(v, size)));
}

function drawSheet(pdf: PDFDocument, ws: ExcelJS.Worksheet, fonts: Fonts, lay: Layout, page: { pageW: number; pageH: number; availH: number }) {
  const { rows, cols, colW, rowH, merges, covered, scale } = lay;
  const colX: number[] = [];
  cols.reduce((x, _, i) => { colX.push(x); return x + colW[i]; }, MARGIN);
  const colPos = new Map(cols.map((c, i) => [c, i]));
  const rowPos = new Map(rows.map((r, i) => [r, i]));

  // Blocks of rows that must stay together because of vertical merges.
  const blockEnd = rows.map((_, i) => i);
  for (const m of merges.values()) {
    if (m.r2 <= m.r1 || !rowPos.has(m.r1)) continue;
    const s = rowPos.get(m.r1)!;
    let e = s;
    for (let r = m.r1; r <= m.r2; r++) if (rowPos.has(r)) e = Math.max(e, rowPos.get(r)!);
    for (let i = s; i <= e; i++) blockEnd[i] = Math.max(blockEnd[i], e);
  }

  // Repeat the first row as a header when it is a plain single row.
  const firstIsHeader = rows.length > 2 && blockEnd[0] === 0;

  let pg: PDFPage = pdf.addPage([page.pageW, page.pageH]);
  let y = page.pageH - MARGIN;
  const titleSize = Math.max(8, 12 * Math.min(1, scale + 0.2));
  pg.drawText(safeText(ws.name, fonts.bold), { x: MARGIN, y: y - titleSize, size: titleSize, font: fonts.bold, color: rgb(0.2, 0.2, 0.2) });
  y -= titleSize + 8;
  const bottom = MARGIN + 10;

  const drawRange = (s: number, e: number) => {
    for (let i = s; i <= e; i++) {
      const r = rows[i];
      for (const c of cols) {
        const key = `${r}:${c}`;
        if (covered.has(key)) continue;
        const cell = ws.getCell(r, c);
        const m = merges.get(key);
        const ci = colPos.get(c)!;
        let w = colW[ci], h = rowH[i];
        if (m) {
          w = 0; for (let cc = m.c1; cc <= m.c2; cc++) if (colPos.has(cc)) w += colW[colPos.get(cc)!];
          h = 0; for (let rr = m.r1; rr <= m.r2; rr++) if (rowPos.has(rr)) h += rowH[rowPos.get(rr)!];
        }
        drawCell(pg, cell, fonts, colX[ci], y - offsetWithin(s, i), w, h, scale);
      }
    }
  };
  const offsetWithin = (s: number, i: number) => { let o = 0; for (let k = s; k < i; k++) o += rowH[k]; return o; };

  let i = 0;
  while (i < rows.length) {
    const e = blockEnd[i];
    let h = 0; for (let k = i; k <= e; k++) h += rowH[k];
    if (y - h < bottom && y < page.pageH - MARGIN - 1) {
      pg = pdf.addPage([page.pageW, page.pageH]);
      y = page.pageH - MARGIN;
      if (firstIsHeader && i > 0) { drawRange(0, 0); y -= rowH[0]; }
    }
    drawRange(i, e);
    y -= h;
    i = e + 1;
  }
}

function drawCell(pg: PDFPage, cell: ExcelJS.Cell, fonts: Fonts, x: number, top: number, w: number, h: number, scale: number) {
  const fill = cell.fill as ExcelJS.FillPattern | undefined;
  const bg = fill && fill.type === 'pattern' && fill.pattern === 'solid' ? argbToRgb(fill.fgColor?.argb) : undefined;
  pg.drawRectangle({ x, y: top - h, width: w, height: h, color: bg, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.3 });

  const b = cell.border || {};
  const side = (s: Partial<ExcelJS.Border> | undefined, x1: number, y1: number, x2: number, y2: number) => {
    if (!s || !s.style) return;
    const thick = s.style === 'thick' ? 1.5 : s.style === 'medium' ? 1 : s.style === 'double' ? 1.2 : 0.5;
    pg.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: thick, color: argbToRgb(s.color?.argb) || rgb(0, 0, 0) });
  };
  side(b.top, x, top, x + w, top);
  side(b.bottom, x, top - h, x + w, top - h);
  side(b.left, x, top, x, top - h);
  side(b.right, x + w, top, x + w, top - h);

  const text = formatCellValue(cell);
  if (!text) return;
  const pad = PAD * Math.min(1, scale);
  const { font, size } = cellFont(cell, fonts, scale);
  const color = argbToRgb(cell.font?.color?.argb) || rgb(0.1, 0.1, 0.1);
  const lines = wrapCell(text, font, size, w - pad * 2);
  const lineH = size * 1.2;
  const blockH = lines.length * lineH;
  const al = cell.alignment || {};
  const isNum = typeof cell.value === 'number' || (cell.type === ExcelJS.ValueType.Formula && typeof cell.result === 'number');
  const horiz = al.horizontal || (isNum ? 'right' : 'left');
  const vert = al.vertical || 'bottom';
  let ty = vert === 'top' ? top - pad : vert === 'middle' ? top - (h - blockH) / 2 : top - h + pad + blockH;
  for (const line of lines) {
    ty -= lineH;
    const lw = font.widthOfTextAtSize(line, size);
    const tx = horiz === 'right' ? x + w - pad - lw : horiz === 'center' || horiz === 'centerContinuous' ? x + (w - lw) / 2 : x + pad + (al.indent || 0) * 6 * scale;
    pg.drawText(line, { x: Math.max(x + 1, tx), y: ty + size * 0.22, size, font, color });
  }
}
