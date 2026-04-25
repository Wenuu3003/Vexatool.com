import { PDFDocument } from "pdf-lib";
import { pdfjsLib } from "./pdfWorker";

interface CompressOptions {
  quality: number; // 1-100
  onProgress?: (current: number, total: number) => void;
}

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  method: "lossless" | "raster" | "original";
  reduced: boolean;
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
  quality: number,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  // Map quality (20-100) to target DPI. PDF default is 72.
  // Lower quality = lower DPI = smaller file.
  const targetDPI = quality < 40 ? 72 : quality < 70 ? 110 : 150;
  const scale = targetDPI / 72;
  const jpegQuality = Math.max(0.4, Math.min(0.9, quality / 100));

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
 * 1) Try lossless re-save first (fast, perfect for text PDFs).
 * 2) If quality < 80 OR lossless saved <5%, try raster compression.
 * 3) Always return the smallest result. If nothing beats the original, return original.
 */
export async function compressPDFSmart(
  fileBuffer: ArrayBuffer,
  options: CompressOptions
): Promise<CompressResult> {
  const { quality, onProgress } = options;
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

  // Step 2: raster (only if user wants real compression OR lossless barely helped)
  const losslessSavings = 1 - best.bytes.byteLength / originalSize;
  const shouldRaster = quality < 80 || losslessSavings < 0.05;

  if (shouldRaster) {
    try {
      const raster = await rasterCompress(fileBuffer, quality, (c, t) => {
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
