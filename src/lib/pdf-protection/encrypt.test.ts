import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import createModule from '@neslinesli93/qpdf-wasm';
import { encryptPdf, passwordError, type PdfEngine } from './encrypt';
const require = createRequire(import.meta.url);
const wasm = join(dirname(require.resolve('@neslinesli93/qpdf-wasm')), 'qpdf.wasm');
async function engine() { return await createModule({ locateFile: () => wasm }) as unknown as PdfEngine; }
async function fixture() { const pdf = await PDFDocument.create(); pdf.addPage([300,400]).drawText('VexaTool encryption regression', { x: 20, y: 200, size: 12 }); pdf.addPage([400,500]); return pdf.save(); }
async function read(bytes: Uint8Array, password?: string) {
  const task = getDocument({ data: bytes.slice(), password, useSystemFonts: true });
  try { const pdf = await task.promise; const page = await pdf.getPage(1); return { count: pdf.numPages, text: (await page.getTextContent()).items.map(i => 'str' in i ? i.str : '').join('') }; }
  finally { await task.destroy(); }
}
describe('actual qpdf AES-256 output, independently read with PDF.js', () => {
  it('requires exact password and preserves pages and text', async () => {
    const output = await encryptPdf(await engine(), await fixture(), ' exact-password-42 ');
    await expect(read(output)).rejects.toMatchObject({ name: 'PasswordException' });
    await expect(read(output, 'incorrect-password')).rejects.toMatchObject({ name: 'PasswordException' });
    await expect(read(output, 'exact-password-42')).rejects.toMatchObject({ name: 'PasswordException' });
    expect(await read(output, ' exact-password-42 ')).toEqual({ count: 2, text: 'VexaTool encryption regression' });
    expect(new TextDecoder('latin1').decode(output)).toMatch(/\/Length 256/);
    await expect(encryptPdf(await engine(), output, 'different-password')).rejects.toThrow('unencrypted');
  });
  it('rejects corrupt input without output', async () => { await expect(encryptPdf(await engine(), new TextEncoder().encode('not a PDF'), 'valid-password')).rejects.toThrow('valid, unencrypted'); });
  it('rejects empty and oversized inputs', async () => {
    const q = await engine();
    await expect(encryptPdf(q, new Uint8Array(), 'valid-password')).rejects.toThrow('25 MB');
    await expect(encryptPdf(q, new Uint8Array(25*1024*1024+1), 'valid-password')).rejects.toThrow('25 MB');
  });
  it('rejects unsafe password lengths and control characters', () => {
    for (const password of ['', 'short', '        ', 'a'.repeat(128), 'é'.repeat(64), 'goodpassword\0']) expect(passwordError(password)).not.toBeNull();
    expect(passwordError(' spaces preserved ')).toBeNull();
  });
  it('never accepts a successful engine status without encrypted output', async () => {
    const bytes = await fixture();
    const fake = { callMain: () => 0, FS: { writeFile() {}, readFile: () => bytes, unlink() {} } };
    await expect(encryptPdf(fake, bytes, 'valid-password')).rejects.toThrow('verification');
  });
});
