import { useState, useCallback } from 'react';
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
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [textBlocks, setTextBlocks] = useState<OCRTextBlock[]>([]);

  const performOCR = useCallback(async (
    canvas: HTMLCanvasElement,
    pageIndex: number,
    language: string = 'eng'
  ): Promise<OCRTextBlock[]> => {
    setIsProcessing(true);
    setProgress({ status: 'Initializing OCR...', progress: 0 });

    try {
      const result = await Tesseract.recognize(canvas, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress({
              status: 'Recognizing text...',
              progress: Math.round(m.progress * 100),
            });
          } else {
            setProgress({
              status: m.status,
              progress: Math.round(m.progress * 100),
            });
          }
        },
      });

      const blocks: OCRTextBlock[] = [];
      
      // Process words for more granular text selection
      if (result.data.words) {
        result.data.words.forEach((word, index) => {
          if (word.text.trim()) {
            blocks.push({
              id: `ocr-${pageIndex}-${index}`,
              text: word.text,
              x: word.bbox.x0,
              y: word.bbox.y0,
              width: word.bbox.x1 - word.bbox.x0,
              height: word.bbox.y1 - word.bbox.y0,
              confidence: word.confidence,
              pageIndex,
            });
          }
        });
      }

      setTextBlocks(prev => [...prev.filter(b => b.pageIndex !== pageIndex), ...blocks]);
      return blocks;
    } catch (error) {
      console.error('OCR error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress({ status: 'Complete', progress: 100 });
    }
  }, []);

  const extractPDFText = useCallback(async (
    pdfDocument: any,
    pageIndex: number
  ): Promise<OCRTextBlock[]> => {
    setIsProcessing(true);
    setProgress({ status: 'Extracting text from PDF...', progress: 0 });

    try {
      const page = await pdfDocument.getPage(pageIndex + 1);
      const textContent = await page.getTextContent();
      // Must match the PDF_RENDER_SCALE used in ProfessionalPDFEditor
      const renderScale = 3.0;
      const viewport = page.getViewport({ scale: renderScale });

      const blocks: OCRTextBlock[] = [];

      textContent.items.forEach((item: any, index: number) => {
        if (item.str && item.str.trim()) {
          // Transform coordinates from PDF space to canvas space using matching scale
          const x = item.transform[4] * renderScale;
          const y = viewport.height - (item.transform[5] * renderScale) - ((item.height || 12) * renderScale);
          
          blocks.push({
            id: `pdf-text-${pageIndex}-${index}`,
            text: item.str,
            x: x,
            y: y,
            width: item.width * renderScale,
            height: (item.height || 12) * renderScale,
            confidence: 100, // Native PDF text has 100% confidence
            pageIndex,
          });
        }
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
      
      // Count text items
      const textItems = textContent.items.filter((item: any) => item.str && item.str.trim());
      
      if (textItems.length > 10) {
        return 'text-based';
      } else if (textItems.length === 0) {
        return 'scanned';
      } else {
        return 'mixed';
      }
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
  }, []);

  return {
    isProcessing,
    progress,
    textBlocks,
    performOCR,
    extractPDFText,
    detectPDFType,
    clearTextBlocks,
  };
};
