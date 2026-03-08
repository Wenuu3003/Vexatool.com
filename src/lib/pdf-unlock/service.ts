import type * as pdfjsLib from "pdfjs-dist";
import { buildUnlockedPdfBlob, createPreviewBlobs } from "./exporter";
import { inspectPdfDocument, openPdfDocument } from "./inspector";
import { validatePdfFile } from "./validator";
import { UnlockPdfError, isUnlockPdfError } from "./classifier";
import type { PdfLogger, UnlockOptions, UnlockOutput } from "./types";

const DEFAULT_RENDER_SCALE = 2;
const DEFAULT_PREVIEW_SCALE = 1.5;
const DEFAULT_PREVIEW_LIMIT = 3;
const DEFAULT_JPEG_QUALITY = 0.92;

const removeInvisibleCharacters = (value: string) => value.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ");

export const buildPasswordCandidates = (password: string): string[] => {
  const normalized = removeInvisibleCharacters(password);
  const trimmed = normalized.trim();
  const compact = trimmed.replace(/\s+/g, "");
  const nfkc = trimmed.normalize("NFKC");
  const nfc = trimmed.normalize("NFC");

  const candidates = [password, normalized, trimmed, nfkc, nfc, compact]
    .filter((value) => value.length > 0);

  return Array.from(new Set(candidates));
};

const logAttempt = (logger: PdfLogger | undefined, event: string, payload?: Record<string, unknown>) => {
  logger?.(event, payload);
};

interface PasswordAttemptResult {
  pdf: pdfjsLib.PDFDocumentProxy;
  passwordUsed: string;
}

export const openWithPasswordCandidates = async (
  data: Uint8Array,
  password: string,
  options: Pick<UnlockOptions, "disableWorker" | "logger">
): Promise<PasswordAttemptResult> => {
  const candidates = buildPasswordCandidates(password);
  const { logger, disableWorker } = options;

  let confirmedIncorrectPassword = false;
  let lastError: UnlockPdfError | null = null;

  for (const candidate of candidates) {
    try {
      logAttempt(logger, "password-attempt", { length: candidate.length });
      const pdf = await openPdfDocument(data, { password: candidate, disableWorker, logger });
      logAttempt(logger, "password-attempt-success", { length: candidate.length });
      return { pdf, passwordUsed: candidate };
    } catch (error) {
      const classified = isUnlockPdfError(error)
        ? error
        : new UnlockPdfError("unknown", "Unknown decrypt error", {}, error);

      logAttempt(logger, "password-attempt-failed", {
        kind: classified.kind,
        rawMessage: classified.details.rawMessage,
      });

      if (classified.kind === "incorrect-password") {
        confirmedIncorrectPassword = true;
        lastError = classified;
        continue;
      }

      if (classified.kind === "password-required") {
        lastError = classified;
        continue;
      }

      // Any parse/encryption limitation should stop immediately.
      throw classified;
    }
  }

  if (confirmedIncorrectPassword) {
    throw new UnlockPdfError(
      "incorrect-password",
      "Password validation failed for all password variations."
    );
  }

  if (lastError) {
    throw lastError;
  }

  throw new UnlockPdfError("password-required", "Password is required to open this PDF.");
};

const renderPageToCanvas = async (
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  logger?: PdfLogger
): Promise<HTMLCanvasElement> => {
  try {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new UnlockPdfError("render-failed", "Canvas 2D context unavailable.");
    }

    await page.render({ canvasContext: context, viewport }).promise;

    logger?.("page-rendered", {
      pageNumber,
      width: canvas.width,
      height: canvas.height,
      scale,
    });

    return canvas;
  } catch (error) {
    if (isUnlockPdfError(error)) throw error;
    throw new UnlockPdfError("render-failed", `Failed to render page ${pageNumber}.`, {}, error);
  }
};

export const unlockPdfFile = async (
  file: File,
  options: UnlockOptions = {}
): Promise<UnlockOutput> => {
  const {
    password,
    renderScale = DEFAULT_RENDER_SCALE,
    previewScale = DEFAULT_PREVIEW_SCALE,
    previewLimit = DEFAULT_PREVIEW_LIMIT,
    jpegQuality = DEFAULT_JPEG_QUALITY,
    onProgress,
    logger,
    disableWorker = false,
  } = options;

  const validation = await validatePdfFile(file);
  logger?.("file-validation", {
    valid: validation.valid,
    mimeType: validation.mimeType,
    extensionMatches: validation.extensionMatches,
    size: validation.size,
    header: validation.header,
  });

  if (!validation.valid) {
    throw new UnlockPdfError("not-a-pdf", validation.message ?? "Invalid PDF file.");
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const inspection = await inspectPdfDocument(data, { disableWorker, logger });

  logger?.("inspection-result", {
    protectionStatus: inspection.protectionStatus,
    pageCount: inspection.pageCount,
    encryptionMarkersDetected: inspection.encryptionMarkersDetected,
    hasRestrictions: inspection.hasRestrictions,
    failure: inspection.failure,
  });

  if (inspection.protectionStatus === "error") {
    const kind = inspection.failure?.kind ?? "parse-failed";
    throw new UnlockPdfError(kind, inspection.failure?.message ?? "Unable to inspect PDF.", inspection.failure);
  }

  if (inspection.protectionStatus === "not-protected") {
    return {
      blob: new Blob([data], { type: "application/pdf" }),
      pageCount: inspection.pageCount,
      previewBlobs: [],
      protectionStatus: "not-protected",
    };
  }

  onProgress?.({ step: "decrypting", progress: 8, detail: "Opening encrypted PDF" });

  let pdf: pdfjsLib.PDFDocumentProxy | null = null;
  let passwordUsed: string | undefined;

  try {
    if (inspection.protectionStatus === "password-protected") {
      if (!password || password.length === 0) {
        throw new UnlockPdfError("password-required", "Password is required for this PDF.");
      }

      const attempt = await openWithPasswordCandidates(data, password, { disableWorker, logger });
      pdf = attempt.pdf;
      passwordUsed = attempt.passwordUsed;
      logger?.("decrypt-success", { pageCount: pdf.numPages, passwordLength: passwordUsed.length });
    } else {
      // Restriction-only PDFs normally open without user password.
      try {
        pdf = await openPdfDocument(data, { disableWorker, logger });
      } catch (error) {
        logger?.("restriction-open-fallback", { reason: "retry-empty-password" });
        pdf = await openPdfDocument(data, { password: "", disableWorker, logger });
      }
      logger?.("restriction-open-success", { pageCount: pdf.numPages });
    }

    const totalPages = pdf.numPages;
    const renderedCanvases: HTMLCanvasElement[] = [];
    const previewCanvases: HTMLCanvasElement[] = [];

    onProgress?.({ step: "rendering", progress: 12, detail: `Rendering ${totalPages} pages` });

    for (let page = 1; page <= totalPages; page++) {
      const canvas = await renderPageToCanvas(pdf, page, renderScale, logger);
      renderedCanvases.push(canvas);

      if (page <= previewLimit) {
        const previewCanvas = await renderPageToCanvas(pdf, page, previewScale, logger);
        previewCanvases.push(previewCanvas);
      }

      const progress = 12 + Math.round((page / totalPages) * 60);
      onProgress?.({ step: "rendering", progress, detail: `Rendered page ${page}/${totalPages}` });
    }

    onProgress?.({ step: "building", progress: 78, detail: "Building unlocked PDF" });

    const previewBlobs = await createPreviewBlobs(previewCanvases, previewLimit, logger);
    const blob = await buildUnlockedPdfBlob(renderedCanvases, jpegQuality, logger);

    onProgress?.({ step: "done", progress: 100, detail: "Unlock complete" });

    return {
      blob,
      pageCount: totalPages,
      previewBlobs,
      protectionStatus: inspection.protectionStatus,
      passwordUsed,
    };
  } finally {
    if (pdf) {
      pdf.destroy();
    }
  }
};
