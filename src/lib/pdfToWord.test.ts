import { describe, expect, it } from 'vitest';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { buildPdfWordDocument } from './pdfToWord';

const image = new Uint8Array([137, 80, 78, 71]);
const xmlOf = async (pages: Parameters<typeof buildPdfWordDocument>[0]) =>
  (await JSZip.loadAsync(await Packer.toBuffer(buildPdfWordDocument(pages)))).file('word/document.xml')!.async('string');

describe('PDF to Word', () => {
  it('writes text pages as editable text, one Word page per PDF page, no images', async () => {
    const xml = await xmlOf([
      { width: 595, height: 842, image, text: 'First page\nAddress' },
      { width: 842, height: 595, image, text: 'Second page' },
    ]);
    expect(xml).toContain('>First page<');
    expect(xml).toContain('>Address<');
    expect(xml).toContain('>Second page<');
    expect(xml).not.toContain('<w:drawing>');
    expect(xml).toContain('w:w="16840" w:h="11900"');
    expect(xml.match(/w:val="nextPage"/g)).toHaveLength(2);
  });
  it('keeps scanned pages without text as images', async () => {
    const xml = await xmlOf([{ width: 595, height: 842, image, text: '' }]);
    expect(xml).toContain('<w:drawing>');
  });
});

describe('PDF to Word layout', () => {
  it('rebuilds aligned multi-column rows as a real Word table', async () => {
    const row = (y: number, cells: string[]) => cells.map((text, i) => ({ x: 40 + i * 120, y, width: 50, size: 10, text }));
    const items = [{ x: 200, y: 40, width: 120, size: 14, text: 'SOUTHERN RAILWAY', bold: true },
      ...row(100, ['SL', 'LOCATION', 'REMARKS']), ...row(115, ['1', 'L NO 128', 'EMPTY']), ...row(130, ['2', 'F 12/20', 'EMPTY'])];
    const xml = await xmlOf([{ width: 595, height: 842, image, text: 'x', items }]);
    expect(xml.match(/<w:tbl>/g)).toHaveLength(1);
    expect(xml.match(/<w:tr>/g)).toHaveLength(3);
    expect(xml).toContain('>L NO 128<');
    expect(xml).toContain('<w:b/>');
  });
});
