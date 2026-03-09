import { useState, useCallback, useRef } from 'react';
import Tesseract from 'tesseract.js';

export interface OCRTextBlock {
  id: string;
  text: string;
  x: number;
  y: number;        // top of visible text in canvas px
  width: number;
  height: number;   // font em-height in canvas px
  confidence: number;
  pageIndex: number;
  fontSizePt?: number; // original font size in PDF points (from PDF text extraction)
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
 * Preprocess canvas image for better OCR accuracy.
 * - Converts to grayscale
 * - Optionally enhances contrast & thresholds for faint/small text
 */
function preprocessForOCR(
  sourceCanvas: HTMLCanvasElement,
  mode: 'normal' | 'enhanced' = 'normal'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(sourceCanvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // Contrast enhancement
  const contrast = mode === 'enhanced' ? 70 : 35;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i] = data[i + 1] = data[i + 2] = v;
  }

  if (mode === 'enhanced') {
    // Binarization threshold — helps for faint, light, or low-contrast text
    for (let i = 0; i < data.length; i += 4) {
      const v = data[i] < 140 ? 0 : 255;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Merge OCR results from multiple passes, deduplicating strongly overlapping blocks.
 */
function mergeOCRBlocks(primary: OCRTextBlock[], secondary: OCRTextBlock[]): OCRTextBlock[] {
  const merged = [...primary];
  for (const block of secondary) {
    const overlaps = merged.some(existing => {
      const ox = Math.max(0, Math.min(existing.x + existing.width, block.x + block.width) - Math.max(existing.x, block.x));
      const oy = Math.max(0, Math.min(existing.y + existing.height, block.y + block.height) - Math.max(existing.y, block.y));
      const overlapArea = ox * oy;
      const blockArea = block.width * block.height;
      return blockArea > 0 && overlapArea / blockArea > 0.4;
    });
    if (!overlaps && block.text.trim()) {
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
  // Throttle progress updates to avoid triggering excessive re-renders / flickering
  const lastProgressRef = useRef(0);

  const runOCRPass = useCallback(async (
    canvas: HTMLCanvasElement,
    pageIndex: number,
    language: string,
    idPrefix: string,
    startProgress: number,
    endProgress: number
  ): Promise<OCRTextBlock[]> => {
    const result = await Tesseract.recognize(canvas, language, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round(startProgress + (m.progress * (endProgress - startProgress)));
          // Only update progress every 5% to reduce re-renders
          if (pct - lastProgressRef.current >= 5) {
            lastProgressRef.current = pct;
            setProgress({ status: 'Recognizing text...', progress: pct });
          }
        }
      },
    });

    const blocks: OCRTextBlock[] = [];
    if (result.data.words) {
      result.data.words.forEach((word, index) => {
        if (word.text.trim()) {
          const h = word.bbox.y1 - word.bbox.y0;
          blocks.push({
            id: `${idPrefix}-${pageIndex}-${index}`,
            text: word.text,
            x: word.bbox.x0,
            y: word.bbox.y0,
            width: word.bbox.x1 - word.bbox.x0,
            height: h,
            confidence: word.confidence,
            pageIndex,
          });
        }
      });
    }
    return blocks;
  }, []);

  /**
   * Dual-pass OCR with image preprocessing for scanned/image PDFs.
   * Pass 1: Normal grayscale + mild contrast
   * Pass 2: Enhanced contrast + binarization (catches faint/small text missed by pass 1)
   */
  const performOCR = useCallback(async (
    canvas: HTMLCanvasElement,
    pageIndex: number,
    language: string = 'eng'
  ): Promise<OCRTextBlock[]> => {
    setIsProcessing(true);
    lastProgressRef.current = 0;
    setProgress({ status: 'Preprocessing (pass 1/2)...', progress: 0 });

    try {
      const pass1Canvas = preprocessForOCR(canvas, 'normal');
      const pass1 = await runOCRPass(pass1Canvas, pageIndex, language, 'ocr-p1', 5, 50);

      setProgress({ status: 'Deep scan pass 2/2 (faint text)...', progress: 52 });
      const pass2Canvas = preprocessForOCR(canvas, 'enhanced');
      const pass2 = await runOCRPass(pass2Canvas, pageIndex, language, 'ocr-p2', 55, 95);

      const merged = mergeOCRBlocks(pass1, pass2);
      const usedFallback = pass2.length > 0;
      const avgConf = merged.length > 0
        ? Math.round(merged.reduce((s, b) => s + b.confidence, 0) / merged.length)
        : 0;

      const newStats: OCRStats = { totalBlocks: merged.length, avgConfidence: avgConf, usedFallback };
      setStats(newStats);
      setTextBlocks(prev => [...prev.filter(b => b.pageIndex !== pageIndex), ...merged]);
      return merged;
    } catch (error) {
      console.error('OCR error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress({ status: 'Complete', progress: 100 });
    }
  }, [runOCRPass]);

  /**
   * Extract native text from a PDF text-layer.
   * CRITICAL FIX: y coordinate now correctly places the top of visible text
   * by using the baseline and font ascent metric, ensuring replacement text
   * aligns exactly with the original on export.
   */
  const extractPDFText = useCallback(async (
    pdfDocument: any,
    pageIndex: number
  ): Promise<OCRTextBlock[]> => {
    setIsProcessing(true);
    setProgress({ status: 'Extracting text...', progress: 0 });

    try {
      const page = await pdfDocument.getPage(pageIndex + 1);
      const textContent = await page.getTextContent();
      const renderScale = 3.0;
      const viewport = page.getViewport({ scale: renderScale });

      const blocks: OCRTextBlock[] = [];
      textContent.items.forEach((item: any, index: number) => {
        if (!item.str || !item.str.trim()) return;

        // item.transform: [scaleX, skewY, skewX, scaleY, tx, ty]
        // For horizontal text: scaleX = scaleY = fontSize in PDF user units
        const fontSizePt = Math.abs(item.transform[3]) || item.height || 12;
        const fontSizeCanvas = fontSizePt * renderScale;

        // PDF baseline in canvas space (PDF Y goes up, canvas Y goes down)
        const baselineCanvas = viewport.height - (item.transform[5] * renderScale);

        // Ascent ≈ 72% of em for Helvetica/standard fonts
        // This is the critical fix: y = TOP of visible text, not bottom of em box
        const ASCENT_RATIO = 0.72;
        const ascent = fontSizeCanvas * ASCENT_RATIO;
        const y = baselineCanvas - ascent;
        const x = item.transform[4] * renderScale;

        blocks.push({
          id: `pdf-text-${pageIndex}-${index}`,
          text: item.str,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: Math.max(10, item.width * renderScale),
          height: fontSizeCanvas, // store em-height (= fontSize in canvas px)
          confidence: 100,
          pageIndex,
          fontSizePt, // store original PDF pt size for accurate replacement
        });
      });

      const newStats: OCRStats = { totalBlocks: blocks.length, avgConfidence: 100, usedFallback: false };
      setStats(newStats);
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
    } catch {
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
