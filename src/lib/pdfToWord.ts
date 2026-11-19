import { Document, ImageRun, Packer, Paragraph, SectionType, TextRun, type ISectionOptions } from 'docx';
import { pdfjsLib, withPdfWorkerFallback } from './pdfWorker';

export interface WordPdfPage { width: number; height: number; image: Uint8Array; text: string }

/**
 * One Word section per PDF page. Pages with real text become editable paragraphs (one per line);
 * scanned pages without text keep the rendered page image. No extra pages are appended.
 */
export function buildPdfWordDocument(pages: WordPdfPage[]) {
  const sections: ISectionOptions[] = pages.map(page => {
    const size = { width: Math.round(page.width * 20), height: Math.round(page.height * 20) };
    if (page.text.trim()) {
      return {
        properties: { type: SectionType.NEXT_PAGE, page: { size, margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: page.text.split('\n').map(line => new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: line, font: 'Arial', size: 20 })],
        })),
      };
    }
    return {
      properties: { type: SectionType.NEXT_PAGE, page: { size, margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 } } },
      children: [new Paragraph({
        spacing: { before: 0, after: 0, line: 1 },
        children: [new ImageRun({ type: 'png', data: page.image,
          transformation: { width: page.width * 96 / 72, height: page.height * 96 / 72 },
          floating: { horizontalPosition: { relative: 'page', offset: 0 }, verticalPosition: { relative: 'page', offset: 0 },
            behindDocument: true, allowOverlap: true },
          altText: { title: 'Scanned PDF page', description: 'Scanned page kept as an image (no text found).', name: 'PDF page' },
        })],
      })],
    };
  });
  return new Document({ sections });
}

export async function convertPdfToWord(file: File, onProgress: (value: number) => void) {
  const bytes = await file.arrayBuffer();
  const pdf = await withPdfWorkerFallback(() => pdfjsLib.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise);
  try {
    const pages: WordPdfPage[] = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const dimensions = page.getViewport({ scale: 1 });
      const scale = Math.min(1.5, Math.sqrt(8000000 / (dimensions.width * dimensions.height)));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Page rendering is unavailable in this browser.');
      await page.render({ canvasContext: context, viewport, background: 'white' }).promise;
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not render PDF page.')), 'image/png'));
      const content = await page.getTextContent();
      let text = '';
      let previous: { y: number; endX: number; height: number } | undefined;
      for (const item of content.items) {
        if (!('str' in item) || !item.str) continue;
        const x = item.transform[4];
        const y = item.transform[5];
        const height = Math.hypot(item.transform[2], item.transform[3]) || Math.abs(item.transform[0]) || 10;
        if (previous) {
          if (Math.abs(y - previous.y) > Math.max(2, previous.height * 0.4)) {
            if (!text.endsWith('\n')) text += '\n';
          } else {
            const gap = x - previous.endX;
            if (gap > previous.height * 0.15 && !/\s$/.test(text) && !/^\s/.test(item.str)) text += ' ';
          }
        }
        text += item.str;
        if (item.hasEOL && !text.endsWith('\n')) text += '\n';
        previous = { y, endX: x + item.width, height };
      }
      pages.push({ width: dimensions.width, height: dimensions.height, image: new Uint8Array(await blob.arrayBuffer()), text: text.trim() });
      canvas.width = 0; canvas.height = 0; page.cleanup();
      onProgress(Math.round(number / pdf.numPages * 80));
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    onProgress(90);
    return { blob: await Packer.toBlob(buildPdfWordDocument(pages)), pageCount: pages.length, preview: pages.map(page => page.text).join('\n\n') };
  } finally { await pdf.destroy(); }
}