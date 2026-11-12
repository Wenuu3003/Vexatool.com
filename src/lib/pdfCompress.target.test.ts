import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { compressPDFToTarget } from './pdfCompress';

async function makePdf(pages: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([612, 792]);
    page.drawText(`Test page ${i + 1} with some content to compress.`, {
      x: 72, y: 720, size: 18, font, color: rgb(0, 0, 0),
    });
  }
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe('compressPDFToTarget honesty rules', () => {
  it('reports achievedTarget=true and stays under target when the target is achievable', async () => {
    const buf = await makePdf(2);
    const target = buf.byteLength + 10 * 1024; // generous target
    const r = await compressPDFToTarget(buf, { targetBytes: target });
    expect(r.achievedTarget).toBe(true);
    expect(r.compressedSize).toBeLessThanOrEqual(target);
    expect(r.bytes.byteLength).toBe(r.compressedSize);
  });

  it('reports achievedTarget=false and exposes minAchievableSize when the target is impossible', async () => {
    const buf = await makePdf(3);
    const r = await compressPDFToTarget(buf, { targetBytes: 100 }); // absurdly small
    expect(r.achievedTarget).toBe(false);
    expect(r.minAchievableSize).toBeGreaterThan(100);
    // must still return a valid, non-empty PDF rather than corrupt output
    expect(r.bytes.byteLength).toBeGreaterThan(0);
    const reload = await PDFDocument.load(r.bytes, { ignoreEncryption: true });
    expect(reload.getPageCount()).toBe(3);
  }, 60000);

  it('never returns output larger than the original when target exceeds original size', async () => {
    const buf = await makePdf(1);
    const r = await compressPDFToTarget(buf, { targetBytes: buf.byteLength * 2 });
    expect(r.compressedSize).toBeLessThanOrEqual(buf.byteLength);
  });
});
