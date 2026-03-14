import { PDFDocument } from "pdf-lib";
import { pdfjsLib } from "./pdfWorker";

interface CompressOptions {
  quality: number; // 1-100
  onProgress?: (current: number, total: number) => void;
}

/**
 * Compress a PDF by rendering each page to canvas and re-embedding as JPEG.
 */
export async function compressPDF(
  fileBuffer: ArrayBuffer,
  options: CompressOptions
): Promise<Uint8Array> {
  const { quality, onProgress } = options;

  const scale = quality < 40 ? 0.6 : quality < 60 ? 0.75 : quality < 80 ? 0.9 : 1.0;
  const jpegQuality = Math.max(0.1, quality / 100);

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(i, numPages);

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const jpegBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        "image/jpeg",
        jpegQuality
      );
    });

    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const jpegImage = await newPdf.embedJpg(jpegBytes);

    const origViewport = page.getViewport({ scale: 1 });
    const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });

    canvas.width = 0;
    canvas.height = 0;
  }

  pdfDoc.destroy();

  return newPdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}
