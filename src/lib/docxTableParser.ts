import JSZip from 'jszip';
import { extractWordText } from './officeText';
export interface DocxTable { rows: string[][]; }
export interface DocxContent { tables: DocxTable[]; paragraphs: string[]; }
const ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const children = (node: Element, name: string) => Array.from(node.children).filter(el => el.namespaceURI === ns && el.localName === name);
const text = (node: Element): string => {
  if (node.namespaceURI === ns) {
    if (node.localName === 't') return node.textContent || '';
    if (node.localName === 'tab') return '\t';
    if (node.localName === 'br' || node.localName === 'cr') return '\n';
  }
  return Array.from(node.children).map(text).join('');
};
const cellText = (cell: Element) => Array.from(cell.getElementsByTagNameNS(ns, 'p')).map(text).join('\n');
/** Extract values and horizontal grid spacing; original Word styling is not preserved. */
export async function parseDocxContent(file: File): Promise<DocxContent> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const source = await zip.file('word/document.xml')?.async('text');
  if (!source) throw new Error('Not a DOCX document.');
  const xml = new DOMParser().parseFromString(source, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Invalid DOCX XML.');
  const body = xml.getElementsByTagNameNS(ns, 'body')[0];
  if (!body) throw new Error('Missing document body.');
  const tables = Array.from(body.getElementsByTagNameNS(ns, 'tbl')).filter(tbl => {
    for (let parent = tbl.parentElement; parent && parent !== body; parent = parent.parentElement) {
      if (parent.namespaceURI === ns && parent.localName === 'tbl') return false;
    }
    return true;
  });
  return {
    tables: tables.map(tbl => ({rows: children(tbl, 'tr').map(row => {
      const values: string[] = [];
      for (const cell of children(row, 'tc')) {
        values.push(cellText(cell));
        const span = Number(cell.getElementsByTagNameNS(ns, 'gridSpan')[0]?.getAttributeNS(ns, 'val') || 1);
        for (let i = 1; i < Math.min(Math.max(span, 1), 1000); i++) values.push('');
      }
      return values;
    })})),
    paragraphs: children(body, 'p').map(text).filter(Boolean)
  };
}
export const extractDocText = extractWordText;
