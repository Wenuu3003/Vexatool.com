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
