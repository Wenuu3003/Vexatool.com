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

/** Result for target-size compression. */
export interface TargetCompressResult extends CompressResult {
  /** Target size in bytes the user requested. */
  targetSize: number;
  /** True when compressedSize <= targetSize. */
  achievedTarget: boolean;
  /** Smallest size we could produce at the lowest quality preset. */
  minAchievableSize: number;
  /** Preset that produced the final bytes (for diagnostics). */
  presetUsed?: { dpi: number; jpeg: number };
}

export interface TargetCompressOptions {
  /** Desired output size in bytes. */
  targetBytes: number;
  onProgress?: (current: number, total: number) => void;
  /**
   * If true, return the smallest achievable file even when it can't
   * reach the target. Defaults to true.
   */
  allowOverflow?: boolean;
}

// Preset → (DPI, JPEG quality). Tuned so "low" never inflates text PDFs.
const PRESETS: Record<CompressionLevel, { dpi: number; jpeg: number }> = {
  low: { dpi: 120, jpeg: 0.82 }, // light touch, near-lossless visual
  medium: { dpi: 100, jpeg: 0.7 }, // balanced default
  high: { dpi: 72, jpeg: 0.55 }, // max shrink for image-heavy PDFs
};

/**
 * Quality ladder for target-size search, ordered from highest to lowest quality.
 * Index 0 = best looking / largest file. Last index = smallest possible file.
 */
const QUALITY_LADDER: Array<{ dpi: number; jpeg: number }> = [
  { dpi: 220, jpeg: 0.92 },
  { dpi: 190, jpeg: 0.88 },
  { dpi: 170, jpeg: 0.82 },
  { dpi: 150, jpeg: 0.78 },
  { dpi: 130, jpeg: 0.72 },
  { dpi: 115, jpeg: 0.66 },
  { dpi: 100, jpeg: 0.6 },
  { dpi: 90, jpeg: 0.52 },
  { dpi: 80, jpeg: 0.45 },
  { dpi: 70, jpeg: 0.4 },
  { dpi: 60, jpeg: 0.34 },
  { dpi: 50, jpeg: 0.28 },
];

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

/**
 * Raster compression using an explicit (dpi, jpeg) preset.
 */
async function rasterCompressPreset(
  fileBuffer: ArrayBuffer,
  preset: { dpi: number; jpeg: number },
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const { dpi, jpeg: jpegQuality } = preset;
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
 * Compress a PDF to a specific target file size (in bytes).
 *
 * Strategy:
 *   1. Run a lossless re-save. If that already fits the target, return it
 *      (highest possible quality result).
 *   2. Probe the lowest quality preset to learn the minimum achievable size.
 *      If that's still larger than the target, return it and flag that the
 *      target is not achievable while preserving document integrity.
 *   3. Binary-search the quality ladder for the *highest* quality preset
 *      whose output still fits the target. Return that.
 */
export async function compressPDFToTarget(
  fileBuffer: ArrayBuffer,
  options: TargetCompressOptions
): Promise<TargetCompressResult> {
  const { targetBytes, onProgress, allowOverflow = true } = options;
  const originalSize = fileBuffer.byteLength;

  // Step 1: lossless baseline.
  onProgress?.(2, 100);
  let lossless: Uint8Array | null = null;
  try {
    lossless = await losslessOptimize(fileBuffer);
  } catch {
    lossless = null;
  }

  let best: { bytes: Uint8Array; method: CompressResult["method"]; preset?: { dpi: number; jpeg: number } } = {
    bytes: new Uint8Array(fileBuffer),
    method: "original",
  };
  if (lossless && lossless.byteLength < best.bytes.byteLength) {
    best = { bytes: lossless, method: "lossless" };
  }

  // Shortcut: if lossless (or original) already meets target, ship it.
  if (best.bytes.byteLength <= targetBytes) {
    onProgress?.(100, 100);
    return {
      bytes: best.bytes,
      originalSize,
      compressedSize: best.bytes.byteLength,
      method: best.method,
      reduced: best.bytes.byteLength < originalSize,
      targetSize: targetBytes,
      achievedTarget: true,
      minAchievableSize: best.bytes.byteLength,
    };
  }

  // Step 2: probe the lowest preset to learn the floor.
  const lowestPreset = QUALITY_LADDER[QUALITY_LADDER.length - 1];
  onProgress?.(8, 100);
  let floorBytes: Uint8Array;
  try {
    floorBytes = await rasterCompressPreset(fileBuffer, lowestPreset, (c, t) => {
      onProgress?.(8 + Math.round((c / t) * 20), 100);
    });
  } catch {
    // Raster failed entirely — return best lossless result we have.
    return {
      bytes: best.bytes,
      originalSize,
      compressedSize: best.bytes.byteLength,
      method: best.method,
      reduced: best.bytes.byteLength < originalSize,
      targetSize: targetBytes,
      achievedTarget: best.bytes.byteLength <= targetBytes,
      minAchievableSize: best.bytes.byteLength,
    };
  }

  const minAchievableSize = floorBytes.byteLength;

  // Target not achievable.
  if (minAchievableSize > targetBytes) {
    onProgress?.(100, 100);
    // Pick smallest available (floor vs lossless vs original).
    let outBytes = floorBytes;
    let outMethod: CompressResult["method"] = "raster";
    if (best.bytes.byteLength < outBytes.byteLength) {
      outBytes = best.bytes;
      outMethod = best.method;
    }
    return {
      bytes: allowOverflow ? outBytes : best.bytes,
      originalSize,
      compressedSize: (allowOverflow ? outBytes : best.bytes).byteLength,
      method: allowOverflow ? outMethod : best.method,
      reduced: (allowOverflow ? outBytes : best.bytes).byteLength < originalSize,
      targetSize: targetBytes,
      achievedTarget: false,
      minAchievableSize,
      presetUsed: allowOverflow ? lowestPreset : undefined,
    };
  }

  // Step 3: binary search the ladder for the highest-quality preset that fits.
  // ladder index 0 = best quality (large), last = smallest. We know last fits.
  let lo = 0; // index of highest-quality candidate (largest output)
  let hi = QUALITY_LADDER.length - 1; // last fits target
  let bestFitBytes: Uint8Array = floorBytes;
  let bestFitPreset = lowestPreset;

  // We've already evaluated index hi. Search [lo, hi-1].
  let probes = 0;
  const maxProbes = 5;
  while (lo <= hi - 1 && probes < maxProbes) {
    const mid = Math.floor((lo + hi) / 2);
    const preset = QUALITY_LADDER[mid];
    probes++;
    const progBase = 30 + probes * 12;
    let candidate: Uint8Array;
    try {
      candidate = await rasterCompressPreset(fileBuffer, preset, (c, t) => {
        onProgress?.(progBase + Math.round((c / t) * 10), 100);
      });
    } catch {
      break;
    }
    if (candidate.byteLength <= targetBytes) {
      // Fits — try higher quality (lower index).
      bestFitBytes = candidate;
      bestFitPreset = preset;
      hi = mid;
    } else {
      // Too big — go lower quality (higher index).
      lo = mid + 1;
    }
  }

  // Compare against lossless in case lossless happens to be smaller.
  let finalBytes = bestFitBytes;
  let finalMethod: CompressResult["method"] = "raster";
  let finalPreset: { dpi: number; jpeg: number } | undefined = bestFitPreset;
  if (best.method !== "original" && best.bytes.byteLength <= targetBytes && best.bytes.byteLength < finalBytes.byteLength) {
    finalBytes = best.bytes;
    finalMethod = best.method;
    finalPreset = undefined;
  }

  onProgress?.(100, 100);
  return {
    bytes: finalBytes,
    originalSize,
    compressedSize: finalBytes.byteLength,
    method: finalMethod,
    reduced: finalBytes.byteLength < originalSize,
    targetSize: targetBytes,
    achievedTarget: finalBytes.byteLength <= targetBytes,
    minAchievableSize,
    presetUsed: finalPreset,
  };
}
