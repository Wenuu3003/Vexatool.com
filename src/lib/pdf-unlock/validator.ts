import type { FileValidationResult } from "./types";

const PDF_HEADER_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const MAX_PDF_SIZE_BYTES = 200 * 1024 * 1024;

export const validatePdfFile = async (file: File): Promise<FileValidationResult> => {
  const mimeType = file.type || "";
  const extensionMatches = file.name.toLowerCase().endsWith(".pdf");

  if (file.size <= 0) {
    return {
      valid: false,
      message: "File is empty.",
      extensionMatches,
      mimeType,
      size: file.size,
      header: "",
      hasPdfHeader: false,
    };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return {
      valid: false,
      message: "File is too large to process in browser.",
      extensionMatches,
      mimeType,
      size: file.size,
      header: "",
      hasPdfHeader: false,
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer.slice(0, 8));
  const header = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");

  const hasPdfHeader = PDF_HEADER_BYTES.every((value, idx) => bytes[idx] === value);

  if (!hasPdfHeader) {
    return {
      valid: false,
      message: "File content is not a valid PDF.",
      extensionMatches,
      mimeType,
      size: file.size,
      header,
      hasPdfHeader,
    };
  }

  const mimeLooksPdf = mimeType === "application/pdf" || mimeType === "";

  return {
    valid: extensionMatches || mimeLooksPdf,
    message: extensionMatches || mimeLooksPdf ? undefined : "File extension/type does not look like PDF.",
    extensionMatches,
    mimeType,
    size: file.size,
    header,
    hasPdfHeader,
  };
};
