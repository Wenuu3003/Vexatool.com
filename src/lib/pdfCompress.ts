import { PDFDocument } from "pdf-lib";
import { pdfjsLib } from "./pdfWorker";

export type CompressionLevel = "low" | "medium" | "high";

interface CompressOptions {
  /** Preferred API: "low" | "medium" | "high". */
  level?: CompressionLevel;
  /** Legacy 1-100 slider. Mapped to a level if `level` is not provided. */
  quality?: number;
  onProgress?: (current: number, total: number) => void;
}

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  method: "lossless" | "raster" | "original";
  reduced: boolean;
}

// Preset → (DPI, JPEG quality). Tuned so "low" never inflates text PDFs.
const PRESETS: Record<CompressionLevel, { dpi: number; jpeg: number }> = {
  low: { dpi: 120, jpeg: 0.82 }, // light touch, near-lossless visual
  medium: { dpi: 100, jpeg: 0.7 }, // balanced default
  high: { dpi: 72, jpeg: 0.55 }, // max shrink for image-heavy PDFs
};

function qualityToLevel(q: number): CompressionLevel {
  if (q >= 80) return "low";
  if (q >= 50) return "medium";
  return "high";
}

/**
 * Lossless re-save: strips unused objects, uses object streams.
 * Works well for text-heavy PDFs that were saved without optimization.
 */
async function losslessOptimize(fileBuffer: ArrayBuffer): Promise<Uint8Array> {
  const src = await PDFDocument.load(fileBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  // Strip metadata to save a few bytes
  src.setTitle("");
  src.setAuthor("");
  src.setSubject("");
  src.setKeywords([]);
  src.setProducer("");
  src.setCreator("");
  return src.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
}

/**
 * Raster compression: render each page to JPEG at controlled DPI.
 * Effective for image-heavy / scanned PDFs.
 */
async function rasterCompress(
  fileBuffer: ArrayBuffer,
  level: CompressionLevel,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const { dpi, jpeg: jpegQuality } = PRESETS[level];
  const scale = dpi / 72;

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(i, numPages);
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d", { alpha: false })!;
    // White background so JPEG doesn't show black for transparent regions
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    const jpegBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/jpeg", jpegQuality);
    });
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const jpegImage = await newPdf.embedJpg(jpegBytes);

    const orig = page.getViewport({ scale: 1 });
    const newPage = newPdf.addPage([orig.width, orig.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: orig.width,
      height: orig.height,
    });

    canvas.width = 0;
    canvas.height = 0;
  }

  pdfDoc.destroy();
  return newPdf.save({ useObjectStreams: true, addDefaultPage: false });
}

/**
 * Smart PDF compression.
 * 1) Always run lossless re-save first (fast — strips junk + metadata).
 * 2) Only run raster compression when it has a chance of helping:
 *    - Level "high" → always try (user explicitly wants max shrink)
 *    - Level "medium" → try only if lossless saved <15%
 *    - Level "low" → try only if lossless saved <3% (very conservative,
 *      because raster on text PDFs almost always inflates them).
 * 3) Return whichever variant is smallest. If none beat the original,
 *    return the original bytes untouched.
 */
export async function compressPDFSmart(
  fileBuffer: ArrayBuffer,
  options: CompressOptions
): Promise<CompressResult> {
  const { onProgress } = options;
  const level: CompressionLevel =
    options.level ?? (options.quality != null ? qualityToLevel(options.quality) : "medium");
  const originalSize = fileBuffer.byteLength;

  let best: { bytes: Uint8Array; method: CompressResult["method"] } = {
    bytes: new Uint8Array(fileBuffer),
    method: "original",
  };

  // Step 1: lossless
  try {
    onProgress?.(1, 10);
    const lossless = await losslessOptimize(fileBuffer);
    if (lossless.byteLength < best.bytes.byteLength) {
      best = { bytes: lossless, method: "lossless" };
    }
  } catch {
    // ignore — fall through to raster
  }

  // Step 2: raster compression — only when it's likely to help.
  // Re-rendering text PDFs as JPEGs almost always inflates them, so we gate
  // raster behind both the user-selected level AND the lossless savings.
  const losslessSavings = 1 - best.bytes.byteLength / originalSize;
  const shouldRaster =
    level === "high" ||
    (level === "medium" && losslessSavings < 0.15) ||
    (level === "low" && losslessSavings < 0.03);

  if (shouldRaster) {
    try {
      const raster = await rasterCompress(fileBuffer, level, (c, t) => {
        // raster phase = 10% to 100% of progress
        onProgress?.(10 + Math.round((c / t) * 90), 100);
      });
      if (raster.byteLength < best.bytes.byteLength) {
        best = { bytes: raster, method: "raster" };
      }
    } catch {
      // raster failed — keep best so far
    }
  }

  onProgress?.(100, 100);

  return {
    bytes: best.bytes,
    originalSize,
    compressedSize: best.bytes.byteLength,
    method: best.method,
    reduced: best.bytes.byteLength < originalSize,
  };
}

/**
 * Backwards-compatible wrapper. Returns bytes only.
 * @deprecated Use compressPDFSmart for size info.
 */
export async function compressPDF(
  fileBuffer: ArrayBuffer,
  options: CompressOptions
): Promise<Uint8Array> {
  const result = await compressPDFSmart(fileBuffer, options);
  return result.bytes;
}
