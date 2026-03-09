import { useState, useCallback, useRef } from 'react';
import Tesseract from 'tesseract.js';

export interface OCRTextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  pageIndex: number;
  fontSize?: number;
  fontColor?: string;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export interface OCRStats {
  totalBlocks: number;
  avgConfidence: number;
  usedFallback: boolean;
}

/**
 * Preprocess a canvas for better OCR accuracy:
 * - Convert to grayscale
 * - Enhance contrast
 * - Apply adaptive thresholding
 */
function preprocessForOCR(
  sourceCanvas: HTMLCanvasElement,
  mode: 'normal' | 'enhanced' = 'normal'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext('2d')!;

  // Draw original
  ctx.drawImage(sourceCanvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  if (mode === 'enhanced') {
    // Higher contrast for faint text
    const contrast = 80; // -255 to 255
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = data[i];
      data[i + 2] = data[i];
    }

    // Simple threshold for very faint text
    const threshold = 160;
    for (let i = 0; i < data.length; i += 4) {
      const v = data[i] < threshold ? 0 : 255;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  } else {
    // Mild contrast boost
    const contrast = 40;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = data[i];
      data[i + 2] = data[i];
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Sharpen via unsharp mask (overlay with blurred difference)
  // Simple approach: draw slightly offset copies at reduced opacity
  ctx.globalCompositeOperation = 'source-over';

  return canvas;
}

/**
 * Merge OCR results from multiple passes, deduplicating overlapping blocks.
 */
function mergeOCRBlocks(primary: OCRTextBlock[], secondary: OCRTextBlock[]): OCRTextBlock[] {
  const merged = [...primary];

  for (const block of secondary) {
    const overlaps = merged.some(existing => {
      const overlapX = Math.max(0, Math.min(existing.x + existing.width, block.x + block.width) - Math.max(existing.x, block.x));
      const overlapY = Math.max(0, Math.min(existing.y + existing.height, block.y + block.height) - Math.max(existing.y, block.y));
      const overlapArea = overlapX * overlapY;
      const blockArea = block.width * block.height;
      return blockArea > 0 && overlapArea / blockArea > 0.4;
    });

    if (!overlaps) {
      merged.push(block);
    }
  }

  return merged;
}

export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [textBlocks, setTextBlocks] = useState<OCRTextBlock[]>([]);
  const [stats, setStats] = useState<OCRStats | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const runSingleOCR = useCallback(async (
    canvas: HTMLCanvasElement,
    pageIndex: number,
    language: string,
    idPrefix: string
  ): Promise<OCRTextBlock[]> => {
    const result = await Tesseract.recognize(canvas, language, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress({
            status: 'Recognizing text...',
            progress: Math.round(m.progress * 100),
          });
        }
      },
    });

    const blocks: OCRTextBlock[] = [];

    if (result.data.words) {
      result.data.words.forEach((word, index) => {
        if (word.text.trim() && word.text.trim().length > 0) {
          blocks.push({
            id: `${idPrefix}-${pageIndex}-${index}`,
            text: word.text,
            x: word.bbox.x0,
            y: word.bbox.y0,
            width: word.bbox.x1 - word.bbox.x0,
            height: word.bbox.y1 - word.bbox.y0,
            confidence: word.confidence,
            pageIndex,
            fontSize: Math.round((word.bbox.y1 - word.bbox.y0) * 0.75),
          });
        }
      });
    }

    return blocks;
  }, []);

  const performOCR = useCallback(async (
    canvas: HTMLCanvasElement,
    pageIndex: number,
    language: string = 'eng'
  ): Promise<OCRTextBlock[]> => {
    setIsProcessing(true);
    setProgress({ status: 'Preprocessing image...', progress: 0 });

    try {
      // Pass 1: Normal preprocessing
      const normalCanvas = preprocessForOCR(canvas, 'normal');
      setProgress({ status: 'OCR Pass 1: Normal scan...', progress: 5 });
      const pass1Blocks = await runSingleOCR(normalCanvas, pageIndex, language, 'ocr-p1');

      // Pass 2: Enhanced preprocessing for faint/small text
      setProgress({ status: 'OCR Pass 2: Enhanced scan for faint text...', progress: 55 });
      const enhancedCanvas = preprocessForOCR(canvas, 'enhanced');
      const pass2Blocks = await runSingleOCR(enhancedCanvas, pageIndex, language, 'ocr-p2');

      // Merge results
      const usedFallback = pass2Blocks.length > 0;
      const merged = mergeOCRBlocks(pass1Blocks, pass2Blocks);

      const avgConf = merged.length > 0
        ? merged.reduce((sum, b) => sum + b.confidence, 0) / merged.length
        : 0;

      setStats({
        totalBlocks: merged.length,
        avgConfidence: Math.round(avgConf),
        usedFallback,
      });

      setTextBlocks(prev => [...prev.filter(b => b.pageIndex !== pageIndex), ...merged]);
      return merged;
    } catch (error) {
      console.error('OCR error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress({ status: 'Complete', progress: 100 });
    }
  }, [runSingleOCR]);

  const extractPDFText = useCallback(async (
    pdfDocument: any,
    pageIndex: number
  ): Promise<OCRTextBlock[]> => {
    setIsProcessing(true);
    setProgress({ status: 'Extracting text from PDF...', progress: 0 });

    try {
      const page = await pdfDocument.getPage(pageIndex + 1);
      const textContent = await page.getTextContent();
      const renderScale = 3.0;
      const viewport = page.getViewport({ scale: renderScale });

      const blocks: OCRTextBlock[] = [];

      textContent.items.forEach((item: any, index: number) => {
        if (item.str && item.str.trim()) {
          const tx = item.transform[4] * renderScale;
          const itemHeight = (item.height || 12) * renderScale;
          const ty = viewport.height - (item.transform[5] * renderScale) - itemHeight;

          blocks.push({
            id: `pdf-text-${pageIndex}-${index}`,
            text: item.str,
            x: tx,
            y: ty,
            width: item.width * renderScale,
            height: itemHeight,
            confidence: 100,
            pageIndex,
            fontSize: Math.round(itemHeight * 0.75),
            fontColor: item.color ? `rgb(${item.color[0] * 255},${item.color[1] * 255},${item.color[2] * 255})` : '#000000',
          });
        }
      });

      setStats({
        totalBlocks: blocks.length,
        avgConfidence: 100,
        usedFallback: false,
      });

      setTextBlocks(prev => [...prev.filter(b => b.pageIndex !== pageIndex), ...blocks]);
      setProgress({ status: 'Complete', progress: 100 });
      return blocks;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const detectPDFType = useCallback(async (
    pdfDocument: any,
    pageIndex: number = 0
  ): Promise<'text-based' | 'scanned' | 'mixed'> => {
    try {
      const page = await pdfDocument.getPage(pageIndex + 1);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.filter((item: any) => item.str && item.str.trim());

      if (textItems.length > 10) return 'text-based';
      if (textItems.length === 0) return 'scanned';
      return 'mixed';
    } catch (error) {
      console.error('PDF type detection error:', error);
      return 'scanned';
    }
  }, []);

  const clearTextBlocks = useCallback((pageIndex?: number) => {
    if (pageIndex !== undefined) {
      setTextBlocks(prev => prev.filter(b => b.pageIndex !== pageIndex));
    } else {
      setTextBlocks([]);
    }
    setStats(null);
  }, []);

  return {
    isProcessing,
    progress,
    textBlocks,
    stats,
    performOCR,
    extractPDFText,
    detectPDFType,
    clearTextBlocks,
  };
};
