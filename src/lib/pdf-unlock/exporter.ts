import jsPDF from "jspdf";
import { UnlockPdfError } from "./classifier";
import type { PdfLogger } from "./types";

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new UnlockPdfError("export-failed", "Failed to convert canvas into blob."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
};

export const createPreviewBlobs = async (
  canvases: HTMLCanvasElement[],
  limit: number,
  logger?: PdfLogger
): Promise<Blob[]> => {
  const targetCanvases = canvases.slice(0, Math.max(0, limit));
  const blobs: Blob[] = [];

  for (let i = 0; i < targetCanvases.length; i++) {
    const blob = await canvasToBlob(targetCanvases[i], "image/png");
    blobs.push(blob);
    logger?.("preview-blob-created", { index: i + 1, size: blob.size });
  }

  return blobs;
};

export const buildUnlockedPdfBlob = async (
  canvases: HTMLCanvasElement[],
  jpegQuality: number,
  logger?: PdfLogger
): Promise<Blob> => {
  if (canvases.length === 0) {
    throw new UnlockPdfError("export-failed", "No rendered pages available for export.");
  }

  const firstPage = canvases[0];
  const pdfDoc = new jsPDF({
    orientation: firstPage.width > firstPage.height ? "landscape" : "portrait",
    unit: "px",
    format: [firstPage.width, firstPage.height],
    compress: true,
  });

  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const imgData = canvas.toDataURL("image/jpeg", jpegQuality);

    if (i > 0) {
      pdfDoc.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? "landscape" : "portrait");
    }

    pdfDoc.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
    logger?.("pdf-export-page-added", { page: i + 1, totalPages: canvases.length });
  }

  const blob = pdfDoc.output("blob");
  logger?.("pdf-export-complete", { size: blob.size, totalPages: canvases.length });
  return blob;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
