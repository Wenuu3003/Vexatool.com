import createModule from '@neslinesli93/qpdf-wasm';
import wasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url';
import { encryptPdf, type PdfEngine } from './encrypt';

self.onmessage = async ({ data }: MessageEvent<{ bytes: Uint8Array; password: string }>) => {
  try {
    if (!globalThis.crypto?.getRandomValues) throw new Error('Encryption requires a secure browser context.');
    // Suppress engine diagnostics, which may include sensitive arguments.
    const options = { locateFile: () => wasmUrl, print: () => {}, printErr: () => {} };
    const engine = await createModule(options);
    const bytes = await encryptPdf(engine as unknown as PdfEngine, data.bytes, data.password);
    self.postMessage({ bytes }, { transfer: [bytes.buffer] });
  } catch (error) {
    const message = error instanceof Error && /^(Use |Choose |Password |Encryption)/.test(error.message)
      ? error.message : 'Unable to encrypt this PDF. No output was downloaded.';
    self.postMessage({ error: message });
  }
};
