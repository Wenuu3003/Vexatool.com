/**
 * Centralized PDF.js worker configuration.
 * All PDF tools must import this module instead of configuring the worker independently.
 * This prevents worker initialization failures across different build environments.
 */
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Use Vite's import.meta.url pattern for the worker
// This is the most reliable approach for Vite-based builds
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
} catch {
  // Fallback to CDN if local worker resolution fails (e.g. in some preview environments)
  const version = pdfjsLib.version;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
}

/**
 * Load a PDF document with robust defaults.
 * Always wraps input as Uint8Array for maximum compatibility.
 */
export async function loadPDF(data: ArrayBuffer, options?: { ignoreEncryption?: boolean }) {
  const uint8 = new Uint8Array(data);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8,
    ...(options?.ignoreEncryption ? {} : {}),
  });
  return loadingTask.promise;
}

const CDN_WORKER = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
let workerCheck: Promise<void> | undefined;

/**
 * Make sure the worker file can actually be downloaded on this device before PDF.js needs it.
 * PDF.js caches a failed worker setup, so a retry after failure doesn't help — we check first and
 * switch to the matching CDN worker when the bundled file can't be fetched (stale cache, blocked file).
 */
export function ensurePdfWorker() {
  workerCheck ??= fetch(String(pdfjsLib.GlobalWorkerOptions.workerSrc), { cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error(String(response.status)); })
    .catch(() => { pdfjsLib.GlobalWorkerOptions.workerSrc = CDN_WORKER; });
  return workerCheck;
}

export async function withPdfWorkerFallback<T>(task: () => Promise<T>): Promise<T> {
  await ensurePdfWorker();
  return task();
}

export { pdfjsLib };
