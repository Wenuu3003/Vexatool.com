import * as pdfjsLib from "pdfjs-dist";
import { classifyPdfProcessingError, UnlockPdfError } from "./classifier";
import type { PdfInspectionResult, PdfLogger } from "./types";

let workerConfigured = false;

export const configurePdfWorker = () => {
  if (workerConfigured) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  workerConfigured = true;
};

export const extractPdfSignals = (data: Uint8Array) => {
  const headerBytes = data.slice(0, 8);
  const fileHeader = Array.from(headerBytes)
    .map((b) => String.fromCharCode(b))
    .join("");

  const scanLength = Math.min(data.length, 350_000);
  const sampleText = new TextDecoder("latin1").decode(data.slice(0, scanLength));

  const encryptionMarkersDetected =
    /\/Encrypt\b/.test(sampleText) ||
    /\/Filter\s*\/Standard\b/.test(sampleText) ||
    /\/CF\b/.test(sampleText);

  return {
    fileHeader,
    encryptionMarkersDetected,
  };
};

interface OpenPdfOptions {
  password?: string;
  disableWorker?: boolean;
  logger?: PdfLogger;
}

export const openPdfDocument = async (
  data: Uint8Array,
  options: OpenPdfOptions = {}
): Promise<pdfjsLib.PDFDocumentProxy> => {
  configurePdfWorker();

  const { password, disableWorker = false, logger } = options;

  const loadingTask = pdfjsLib.getDocument({
    data: data.slice(),
    password,
    useSystemFonts: true,
    disableWorker,
  });

  try {
    const pdf = await loadingTask.promise;
    logger?.("pdf-open-success", { hasPassword: Boolean(password), pageCount: pdf.numPages });
    return pdf;
  } catch (error) {
    const signals = extractPdfSignals(data);
    const classified = classifyPdfProcessingError(error, {
      passwordProvided: Boolean(password && password.length > 0),
      encryptionMarkersDetected: signals.encryptionMarkersDetected,
    });

    logger?.("pdf-open-failed", {
      hasPassword: Boolean(password),
      errorKind: classified.kind,
      errorName: classified.details.name,
      errorCode: classified.details.code,
      rawMessage: classified.details.rawMessage,
    });

    throw classified;
  }
};

interface InspectOptions {
  disableWorker?: boolean;
  logger?: PdfLogger;
}

export const inspectPdfDocument = async (
  data: Uint8Array,
  options: InspectOptions = {}
): Promise<PdfInspectionResult> => {
  const { logger, disableWorker = false } = options;
  const signals = extractPdfSignals(data);

  logger?.("pdf-inspection-start", {
    bytes: data.length,
    fileHeader: signals.fileHeader,
    encryptionMarkersDetected: signals.encryptionMarkersDetected,
  });

  try {
    const pdf = await openPdfDocument(data, { disableWorker, logger });
    const permissions = await pdf.getPermissions();
    const hasRestrictions = Array.isArray(permissions) && permissions.length > 0;
    const pageCount = pdf.numPages;
    pdf.destroy();

    const protectionStatus = hasRestrictions || signals.encryptionMarkersDetected
      ? "restriction-only"
      : "not-protected";

    logger?.("pdf-inspection-success", {
      pageCount,
      hasRestrictions,
      protectionStatus,
    });

    return {
      protectionStatus,
      pageCount,
      hasRestrictions,
      encryptionMarkersDetected: signals.encryptionMarkersDetected,
      fileHeader: signals.fileHeader,
    };
  } catch (error) {
    const classified = error instanceof UnlockPdfError
      ? error
      : classifyPdfProcessingError(error, {
          passwordProvided: false,
          encryptionMarkersDetected: signals.encryptionMarkersDetected,
        });

    if (classified.kind === "password-required" || classified.kind === "incorrect-password") {
      logger?.("pdf-inspection-password-protected", {
        errorKind: classified.kind,
        rawMessage: classified.details.rawMessage,
      });

      return {
        protectionStatus: "password-protected",
        pageCount: 0,
        hasRestrictions: false,
        encryptionMarkersDetected: true,
        fileHeader: signals.fileHeader,
      };
    }

    logger?.("pdf-inspection-error", {
      errorKind: classified.kind,
      rawMessage: classified.details.rawMessage,
    });

    return {
      protectionStatus: "error",
      pageCount: 0,
      hasRestrictions: false,
      encryptionMarkersDetected: signals.encryptionMarkersDetected,
      fileHeader: signals.fileHeader,
      failure: classified.details,
    };
  }
};
