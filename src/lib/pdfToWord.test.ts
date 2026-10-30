import { describe, expect, it } from 'vitest';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { buildPdfWordDocument } from './pdfToWord';

const image = new Uint8Array([137, 80, 78, 71]);
describe('PDF to Word page preservation', () => {
  it('embeds both original pages at their dimensions and retains editable text separately', async () => {
    const zip = await JSZip.loadAsync(await Packer.toBuffer(buildPdfWordDocument([
      { width: 595, height: 842, image, text: 'First page\nAddress' },
      { width: 842, height: 595, image, text: 'Second page' },
    ])));
    const xml = await zip.file('word/document.xml')?.async('string');
    expect(xml?.match(/<w:drawing>/g)).toHaveLength(2);
    expect(xml).toContain('w:w="11900" w:h="16840"');
    expect(xml).toContain('w:w="16840" w:h="11900"');
    expect(xml).toContain('Editable extracted text');
    expect(xml).toContain('First page');
    expect(xml).toContain('Second page');
    expect(xml?.match(/w:val="nextPage"/g)?.length).toBeGreaterThanOrEqual(2);
  });
  it('keeps scanned pages as images without inventing editable OCR text', async () => {
    const zip = await JSZip.loadAsync(await Packer.toBuffer(buildPdfWordDocument([{ width: 595, height: 842, image, text: '' }])));
    const xml = await zip.file('word/document.xml')?.async('string');
    expect(xml).toContain('<w:drawing>');
    expect(xml).not.toContain('Editable extracted text');
  });
});