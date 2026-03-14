/**
 * Centralized PDF.js worker configuration.
 * All PDF tools must import this module instead of configuring the worker independently.
 * This prevents worker initialization failures across different build environments.
 */
import * as pdfjsLib from "pdfjs-dist";

// Use Vite's import.meta.url pattern for the worker
// This is the most reliable approach for Vite-based builds
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
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

export { pdfjsLib };
