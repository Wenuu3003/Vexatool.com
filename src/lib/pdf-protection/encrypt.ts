import { PDFDocument } from 'pdf-lib';

export const MAX_PDF_BYTES = 25 * 1024 * 1024;
export function passwordError(password: string): string | null {
  if (password.trim().length < 8) return 'Use at least 8 non-padding characters.';
  if (new TextEncoder().encode(password).length > 127) return 'Password must be at most 127 UTF-8 bytes.';
  if (/[\u0000-\u001f\u007f]/.test(password)) return 'Password cannot contain control characters.';
  return null;
}
export interface PdfEngine {
  callMain(args: string[]): number;
  FS: { writeFile(path: string, data: Uint8Array): void; readFile(path: string): Uint8Array; unlink(path: string): void };
}

// One disposable engine per operation. Never serialize a PDF with pdf-lib here:
// it is only a preflight check; qpdf preserves the input's document objects.
export async function encryptPdf(engine: PdfEngine, bytes: Uint8Array, password: string) {
  const invalid = passwordError(password);
  if (invalid) throw new Error(invalid);
  if (!bytes.length || bytes.length > MAX_PDF_BYTES) throw new Error('Choose a PDF up to 25 MB.');
  try {
    const input = await PDFDocument.load(bytes);
    if (!input.getPageCount()) throw new Error('No pages');
  } catch {
    throw new Error('Use a valid, unencrypted PDF. Already encrypted PDFs are not supported.');
  }
  const inputPath = '/input.pdf';
  const outputPath = '/output.pdf';
  try {
    engine.FS.writeFile(inputPath, bytes);
    // Both passwords are nonempty. No artificial printing/copying restrictions.
    const status = engine.callMain(['--encrypt', password, password, '256', '--', inputPath, outputPath]);
    if (status !== 0) throw new Error('Encryption failed. No output was downloaded.');
    const result = new Uint8Array(engine.FS.readFile(outputPath));
    const protectedDoc = await PDFDocument.load(result, { ignoreEncryption: true });
    if (!protectedDoc.isEncrypted) throw new Error('Encryption verification failed. No output was downloaded.');
    return result;
  } finally {
    for (const path of [inputPath, outputPath]) {
      try { engine.FS.unlink(path); } catch { /* May not exist on failure. */ }
    }
  }
}
