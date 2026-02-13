import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface CompressOptions {
  quality: number; // 1-100
  onProgress?: (current: number, total: number) => void;
}

/**
 * Compress a PDF by rendering each page to canvas and re-embedding as JPEG.
 * This achieves real compression, especially for image-heavy PDFs.
 */
export async function compressPDF(
  fileBuffer: ArrayBuffer,
  options: CompressOptions
): Promise<Uint8Array> {
  const { quality, onProgress } = options;

  // Scale factor based on quality: lower quality = smaller render = smaller file
  const scale = quality < 40 ? 0.6 : quality < 60 ? 0.75 : quality < 80 ? 0.9 : 1.0;
  const jpegQuality = Math.max(0.1, quality / 100);

  // Load with pdfjs-dist for rendering
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  // Create new PDF with pdf-lib
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(i, numPages);

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    // Render page to canvas
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert canvas to JPEG blob
    const jpegBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        "image/jpeg",
        jpegQuality
      );
    });

    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

    // Embed JPEG into new PDF
    const jpegImage = await newPdf.embedJpg(jpegBytes);

    // Use original page dimensions (not scaled) for the PDF page
    const origViewport = page.getViewport({ scale: 1 });
    const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });

    // Cleanup
    canvas.width = 0;
    canvas.height = 0;
  }

  pdfDoc.destroy();

  return newPdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}
