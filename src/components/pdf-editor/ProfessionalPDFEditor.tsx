import { useState, useCallback, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { useFileHistory } from '@/hooks/useFileHistory';
import { 
  AnyElement, 
  TextElement, 
  ShapeElement, 
  ImageElement, 
  DrawingElement,
  WatermarkElement,
  RedactElement,
  PageInfo, 
  Tool,
  ZOOM_LEVELS,
  BrushSettings,
  EraserSettings
} from './types';
import { getAlignedPdfTextPlacement } from './pdfTextAlignment';
import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { PageThumbnails } from './PageThumbnails';
import { WatermarkDialog } from './WatermarkDialog';
import { DownloadPreviewDialog } from './DownloadPreviewDialog';
import { OCRPanel } from './OCRPanel';
import { TextSelectionLayer } from './TextSelectionLayer';
import { useEditorHistory } from './useEditorHistory';
import { useOCR, OCRTextBlock } from './useOCR';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// High-res rendering scale for 4K quality PDF display
const PDF_RENDER_SCALE = 3.0;

interface ProfessionalPDFEditorProps {
  file: File;
  onClose: () => void;
}

export const ProfessionalPDFEditor = ({ file, onClose }: ProfessionalPDFEditorProps) => {
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Core state
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [elements, setElements] = useState<AnyElement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWatermarkDialog, setShowWatermarkDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  
  // OCR and text selection state
  const [pdfType, setPdfType] = useState<'text-based' | 'scanned' | 'mixed' | null>(null);
  const [textSelectionEnabled, setTextSelectionEnabled] = useState(false);
  const [deletedTextBlocks, setDeletedTextBlocks] = useState<Set<string>>(new Set());
  
  // OCR hook
  const { 
    isProcessing: isOCRProcessing, 
    progress: ocrProgress, 
    textBlocks, 
    performOCR, 
    extractPDFText,
    detectPDFType,
    clearTextBlocks 
  } = useOCR();
  
  // Brush and eraser settings
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    color: '#000000',
    size: 8,
    opacity: 1,
  });
  const [eraserSettings, setEraserSettings] = useState<EraserSettings>({
    size: 20,
  });
  
  // History for undo/redo
  const { saveToHistory, undo, redo, canUndo, canRedo, resetHistory } = useEditorHistory(
    elements,
    pages,
    setElements,
    setPages
  );

  // Load PDF on mount - run only once when file changes
  useEffect(() => {
    let isCancelled = false;
    
    const loadPDF = async () => {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (isCancelled) return;
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (isCancelled) return;
        
        setPdfDocument(pdf);
        
        const loadedPages: PageInfo[] = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          if (isCancelled) return;
          
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
          
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          const ctx = canvas.getContext('2d')!;
          await page.render({
            canvasContext: ctx,
            viewport,
          }).promise;
          
          loadedPages.push({
            pageNumber: i,
            rotation: 0,
            deleted: false,
            canvas,
            width: viewport.width,
            height: viewport.height,
          });
        }
        
        if (isCancelled) return;
        
        setPages(loadedPages);
        
        // Detect PDF type
        const type = await detectPDFType(pdf, 0);
        if (isCancelled) return;
        
        setPdfType(type);
        
        toast({
          title: 'PDF Loaded',
          description: `${type === 'text-based' ? 'Text-based' : type === 'scanned' ? 'Scanned/Image' : 'Mixed'} PDF detected. ${pdf.numPages} page(s).`,
        });
      } catch (error) {
        if (isCancelled) return;
        console.error('Error loading PDF:', error);
        toast({
          title: 'Error',
          description: 'Failed to load PDF file',
          variant: 'destructive',
        });
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    
    loadPDF();
    
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement && !document.activeElement?.closest('input, textarea')) {
          e.preventDefault();
          handleDelete();
        }
      }
      
      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !document.activeElement?.closest('input, textarea')) {
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('select'); break;
          case 'h': setActiveTool('pan'); break;
          case 't': setActiveTool('text'); break;
          case 'r': setActiveTool('rectangle'); break;
          case 'c': setActiveTool('circle'); break;
          case 'l': setActiveTool('line'); break;
          case 'a': setActiveTool('arrow'); break;
          case 'p': setActiveTool('pen'); break;
          case 'x': setActiveTool('redact'); break;
          case 'i': setActiveTool('image'); imageInputRef.current?.click(); break;
          case 'w': setActiveTool('watermark'); setShowWatermarkDialog(true); break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, undo, redo]);

  // OCR handlers
  const handleRunOCR = useCallback(async () => {
    const currentPageData = pages[currentPage];
    if (!currentPageData?.canvas) {
      toast({
        title: 'Error',
        description: 'Page canvas not available for OCR',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await performOCR(currentPageData.canvas, currentPage, 'eng');
      setTextSelectionEnabled(true);
      toast({
        title: 'OCR Complete',
        description: 'Text detected. Click on highlighted areas to edit or delete.',
      });
    } catch (error) {
      toast({
        title: 'OCR Failed',
        description: 'Failed to perform OCR. Please try again.',
        variant: 'destructive',
      });
    }
  }, [pages, currentPage, performOCR, toast]);

  const handleExtractText = useCallback(async () => {
    if (!pdfDocument) return;
    
    try {
      await extractPDFText(pdfDocument, currentPage);
      setTextSelectionEnabled(true);
      toast({
        title: 'Text Extracted',
        description: 'Selectable text detected. Click on text to edit or delete.',
      });
    } catch (error) {
      toast({
        title: 'Extraction Failed',
        description: 'Failed to extract text. Try OCR for scanned content.',
        variant: 'destructive',
      });
    }
  }, [pdfDocument, currentPage, extractPDFText, toast]);

  // Text edit handlers
  const handleTextDelete = useCallback((blockId: string) => {
    const block = textBlocks.find(b => b.id === blockId);
    if (!block) return;
    
    // Add a white redact element to cover the deleted text
    const redactElement: RedactElement = {
      id: `redact-${Date.now()}`,
      type: 'redact',
      page: block.pageIndex,
      x: block.x,
      y: block.y,
      width: block.width + 4,
      height: block.height + 2,
      rotation: 0,
      opacity: 1,
      locked: false,
      zIndex: elements.length,
      fillColor: '#FFFFFF',
    };
    
    setElements(prev => [...prev, redactElement]);
    setDeletedTextBlocks(prev => new Set(prev).add(blockId));
    saveToHistory();
    
    toast({
      title: 'Text Deleted',
      description: 'Original text covered. Add new text if needed.',
    });
  }, [textBlocks, elements.length, saveToHistory, toast]);

  const handleTextReplace = useCallback((blockId: string, newText: string, originalBlock: OCRTextBlock) => {
    // First, cover the original text with a white redact
    const redactElement: RedactElement = {
      id: `redact-${Date.now()}`,
      type: 'redact',
      page: originalBlock.pageIndex,
      x: originalBlock.x,
      y: originalBlock.y,
      width: originalBlock.width + 4,
      height: originalBlock.height + 2,
      rotation: 0,
      opacity: 1,
      locked: false,
      zIndex: elements.length,
      fillColor: '#FFFFFF',
    };
    
    // Then add new text at the same position
    const textElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      page: originalBlock.pageIndex,
      x: originalBlock.x,
      y: originalBlock.y,
      width: Math.max(originalBlock.width, newText.length * (originalBlock.height * 0.6)),
      height: originalBlock.height,
      rotation: 0,
      opacity: 1,
      locked: false,
      zIndex: elements.length + 1,
      text: newText,
      fontSize: Math.max(8, Math.round(originalBlock.height * 0.85)),
      fontFamily: 'Helvetica',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#000000',
    };
    
    setElements(prev => [...prev, redactElement, textElement]);
    setDeletedTextBlocks(prev => new Set(prev).add(blockId));
    saveToHistory();
    
    toast({
      title: 'Text Replaced',
      description: 'New text added in place of original.',
    });
  }, [elements.length, saveToHistory, toast]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.findIndex(l => l.value === zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1].value);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.findIndex(l => l.value === zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1].value);
    }
  }, [zoom]);

  const handleFitToWidth = useCallback(() => {
    setZoom(1);
  }, []);

  const handleFitToPage = useCallback(() => {
    setZoom(0.75);
  }, []);

  // Element operations
  const handleAddElement = useCallback((element: AnyElement) => {
    setElements(prev => [...prev, element]);
    saveToHistory();
  }, [saveToHistory]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<AnyElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } as AnyElement : el
    ));
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedElement) return;
    setElements(prev => prev.filter(el => el.id !== selectedElement));
    setSelectedElement(null);
    saveToHistory();
  }, [selectedElement, saveToHistory]);

  const handleDuplicate = useCallback(() => {
    if (!selectedElement) return;
    const element = elements.find(el => el.id === selectedElement);
    if (element) {
      const newElement: AnyElement = {
        ...element,
        id: `${element.type}-${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
        zIndex: elements.length,
      };
      setElements(prev => [...prev, newElement]);
      setSelectedElement(newElement.id);
      saveToHistory();
    }
  }, [selectedElement, elements, saveToHistory]);

  const handleToggleLock = useCallback(() => {
    if (!selectedElement) return;
    setElements(prev => prev.map(el => 
      el.id === selectedElement ? { ...el, locked: !el.locked } : el
    ));
    saveToHistory();
  }, [selectedElement, saveToHistory]);

  const handleReset = useCallback(() => {
    setElements([]);
    setPages(pages.map(p => ({ ...p, rotation: 0, deleted: false })));
    setSelectedElement(null);
    setDeletedTextBlocks(new Set());
    clearTextBlocks();
    setTextSelectionEnabled(false);
    resetHistory();
    toast({ title: 'Reset', description: 'All changes have been reset' });
  }, [pages, resetHistory, clearTextBlocks, toast]);

  // Page operations
  const handleRotatePage = useCallback((index: number) => {
    setPages(prev => prev.map((p, i) => 
      i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ));
    saveToHistory();
  }, [saveToHistory]);

  const handleDeletePage = useCallback((index: number) => {
    setPages(prev => prev.map((p, i) => 
      i === index ? { ...p, deleted: true } : p
    ));
    if (currentPage === index && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
    saveToHistory();
  }, [currentPage, saveToHistory]);

  const handleDuplicatePage = useCallback((index: number) => {
    const page = pages[index];
    if (page) {
      const newPage: PageInfo = {
        ...page,
        pageNumber: pages.length + 1,
      };
      setPages(prev => [...prev.slice(0, index + 1), newPage, ...prev.slice(index + 1)]);
      saveToHistory();
    }
  }, [pages, saveToHistory]);

  const handleAddBlankPage = useCallback((afterIndex: number) => {
    const newPage: PageInfo = {
      pageNumber: pages.length + 1,
      rotation: 0,
      deleted: false,
      width: 612 * PDF_RENDER_SCALE,
      height: 792 * PDF_RENDER_SCALE,
      canvas: undefined,
    };
    setPages(prev => [...prev.slice(0, afterIndex + 1), newPage, ...prev.slice(afterIndex + 1)]);
    saveToHistory();
  }, [pages.length, saveToHistory]);

  const handleReorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPages(prev => {
      const newPages = [...prev];
      const [removed] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, removed);
      return newPages;
    });
    saveToHistory();
  }, [saveToHistory]);

  // Image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        
        const imageElement: ImageElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          page: currentPage,
          x: 100,
          y: 100,
          width: img.width * scale,
          height: img.height * scale,
          rotation: 0,
          opacity: 1,
          locked: false,
          zIndex: elements.length,
          src: event.target?.result as string,
          originalWidth: img.width,
          originalHeight: img.height,
        };
        
        handleAddElement(imageElement);
        setSelectedElement(imageElement.id);
        setActiveTool('select');
      };
      img.src = event.target?.result as string;
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [currentPage, elements.length, handleAddElement]);

  // Watermark handling
  const handleApplyWatermark = useCallback((watermark: Omit<WatermarkElement, 'id' | 'zIndex'>) => {
    const wmElement: WatermarkElement = {
      ...watermark,
      id: `watermark-${Date.now()}`,
      zIndex: elements.length,
    };
    handleAddElement(wmElement);
  }, [elements.length, handleAddElement]);

  // Tool change handler
  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);
    if (tool === 'image') {
      imageInputRef.current?.click();
    } else if (tool === 'watermark') {
      setShowWatermarkDialog(true);
    }
  }, []);

  // Show download preview dialog
  const handleShowDownloadDialog = useCallback(() => {
    setShowDownloadDialog(true);
  }, []);

  // Download PDF
  const handleDownload = useCallback(async () => {
    if (!pdfDocument) return;
    
    setShowDownloadDialog(false);
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();
      
      // Embed fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
      
      const fontMap: Record<string, typeof helveticaFont> = {
        'Helvetica': helveticaFont,
        'Arial': helveticaFont,
        'Times-Roman': timesFont,
        'Georgia': timesFont,
        'Courier': courierFont,
      };
      
      // Process each page
      for (let i = 0; i < pdfPages.length; i++) {
        const pageInfo = pages[i];
        if (!pageInfo || pageInfo.deleted) continue;
        
        const page = pdfPages[i];
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        // Apply rotation
        if (pageInfo.rotation !== 0) {
          page.setRotation({ angle: pageInfo.rotation, type: 'degrees' } as any);
        }
        
        // Get elements for this page
        const pageElements = elements.filter(el => 
          el.page === i || (el.type === 'watermark' && (el as WatermarkElement).applyTo === 'all')
        );
        
        // Scale factor from editor canvas-space (PDF.js viewport at scale 1.5)
        // to PDF user space (pdf-lib points). Since `pageInfo.width/height` are
        // stored from `page.getViewport({ scale: 1.5 })`, we must scale back down.
        const scaleFactor = pageWidth / pageInfo.width;
        
        for (const element of pageElements) {
          if (element.type === 'text') {
            const textEl = element as TextElement;
            const font = fontMap[textEl.fontFamily] || helveticaFont;
            
            const color = textEl.color.replace('#', '');
            const r = parseInt(color.substring(0, 2), 16) / 255;
            const g = parseInt(color.substring(2, 4), 16) / 255;
            const b = parseInt(color.substring(4, 6), 16) / 255;
            
            const placement = getAlignedPdfTextPlacement({
              pageHeight,
              scaleFactor,
              x: textEl.x,
              y: textEl.y,
              width: textEl.width,
              height: textEl.height,
              fontSize: textEl.fontSize,
              font,
            });

            page.drawText(textEl.text, {
              x: placement.x,
              y: placement.y,
              size: placement.size,
              font,
              color: rgb(r, g, b),
              opacity: textEl.opacity,
            });
          } else if (element.type === 'shape') {
            const shapeEl = element as ShapeElement;
            const strokeColor = shapeEl.strokeColor.replace('#', '');
            const sr = parseInt(strokeColor.substring(0, 2), 16) / 255;
            const sg = parseInt(strokeColor.substring(2, 4), 16) / 255;
            const sb = parseInt(strokeColor.substring(4, 6), 16) / 255;
            
            const x = shapeEl.x * scaleFactor;
            const y = pageHeight - (shapeEl.y * scaleFactor) - (shapeEl.height * scaleFactor);
            const width = shapeEl.width * scaleFactor;
            const height = shapeEl.height * scaleFactor;
            
            if (shapeEl.shapeType === 'rectangle') {
              page.drawRectangle({
                x,
                y,
                width,
                height,
                borderColor: rgb(sr, sg, sb),
                borderWidth: shapeEl.strokeWidth,
                opacity: shapeEl.opacity,
              });
            } else if (shapeEl.shapeType === 'circle') {
              page.drawEllipse({
                x: x + width / 2,
                y: y + height / 2,
                xScale: width / 2,
                yScale: height / 2,
                borderColor: rgb(sr, sg, sb),
                borderWidth: shapeEl.strokeWidth,
                opacity: shapeEl.opacity,
              });
            } else if (shapeEl.shapeType === 'line' || shapeEl.shapeType === 'arrow') {
              page.drawLine({
                start: { x, y: y + height },
                end: { x: x + width, y },
                color: rgb(sr, sg, sb),
                thickness: shapeEl.strokeWidth,
                opacity: shapeEl.opacity,
              });
            }
          } else if (element.type === 'image') {
            const imgEl = element as ImageElement;
            try {
              const imageData = imgEl.src;
              let image;
              if (imageData.includes('data:image/png')) {
                const base64Data = imageData.split(',')[1];
                image = await pdfDoc.embedPng(Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)));
              } else {
                const base64Data = imageData.split(',')[1];
                image = await pdfDoc.embedJpg(Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)));
              }
              
              const x = imgEl.x * scaleFactor;
              const y = pageHeight - (imgEl.y * scaleFactor) - (imgEl.height * scaleFactor);
              
              page.drawImage(image, {
                x,
                y,
                width: imgEl.width * scaleFactor,
                height: imgEl.height * scaleFactor,
                opacity: imgEl.opacity,
              });
            } catch (err) {
              console.error('Error embedding image:', err);
            }
          } else if (element.type === 'watermark') {
            const wmEl = element as WatermarkElement;
            if (wmEl.watermarkType === 'text' && wmEl.text) {
              const font = fontMap[wmEl.fontFamily || 'Helvetica'] || helveticaFont;
              const color = (wmEl.color || '#CCCCCC').replace('#', '');
              const r = parseInt(color.substring(0, 2), 16) / 255;
              const g = parseInt(color.substring(2, 4), 16) / 255;
              const b_val = parseInt(color.substring(4, 6), 16) / 255;
              
              const fontSize = (wmEl.fontSize || 48) * scaleFactor;
              const textWidth = font.widthOfTextAtSize(wmEl.text, fontSize);
              
              if (wmEl.position === 'tiled') {
                for (let tx = 0; tx < pageWidth; tx += textWidth + 100) {
                  for (let ty = 0; ty < pageHeight; ty += fontSize * 3) {
                    page.drawText(wmEl.text, {
                      x: tx,
                      y: ty,
                      size: fontSize,
                      font,
                      color: rgb(r, g, b_val),
                      opacity: wmEl.opacity,
                      rotate: { angle: wmEl.rotation, type: 'degrees' } as any,
                    });
                  }
                }
              } else {
                const x = (pageWidth - textWidth) / 2;
                const y = pageHeight / 2;
                
                page.drawText(wmEl.text, {
                  x,
                  y,
                  size: fontSize,
                  font,
                  color: rgb(r, g, b_val),
                  opacity: wmEl.opacity,
                  rotate: { angle: wmEl.rotation, type: 'degrees' } as any,
                });
              }
            }
          } else if (element.type === 'drawing') {
            const drawEl = element as DrawingElement;
            if (drawEl.points && drawEl.points.length > 1) {
              const strokeColor = drawEl.strokeColor.replace('#', '');
              const sr = parseInt(strokeColor.substring(0, 2), 16) / 255;
              const sg = parseInt(strokeColor.substring(2, 4), 16) / 255;
              const sb = parseInt(strokeColor.substring(4, 6), 16) / 255;
              
              for (let j = 0; j < drawEl.points.length - 1; j++) {
                const startPoint = drawEl.points[j];
                const endPoint = drawEl.points[j + 1];
                
                const startX = (drawEl.x + startPoint.x) * scaleFactor;
                const startY = pageHeight - ((drawEl.y + startPoint.y) * scaleFactor);
                const endX = (drawEl.x + endPoint.x) * scaleFactor;
                const endY = pageHeight - ((drawEl.y + endPoint.y) * scaleFactor);
                
                page.drawLine({
                  start: { x: startX, y: startY },
                  end: { x: endX, y: endY },
                  color: rgb(sr, sg, sb),
                  thickness: drawEl.strokeWidth * scaleFactor,
                  opacity: drawEl.opacity,
                });
              }
            }
          } else if (element.type === 'redact') {
            const redactEl = element as RedactElement;
            const fillColor = redactEl.fillColor.replace('#', '');
            const fr = parseInt(fillColor.substring(0, 2), 16) / 255;
            const fg = parseInt(fillColor.substring(2, 4), 16) / 255;
            const fb = parseInt(fillColor.substring(4, 6), 16) / 255;
            
            const x = redactEl.x * scaleFactor;
            const y = pageHeight - (redactEl.y * scaleFactor) - (redactEl.height * scaleFactor);
            
            page.drawRectangle({
              x,
              y,
              width: redactEl.width * scaleFactor,
              height: redactEl.height * scaleFactor,
              color: rgb(fr, fg, fb),
              opacity: redactEl.opacity,
            });
          }
        }
      }
      
      // Save and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
      
      await saveFileHistory(file.name, 'pdf', 'edit');
      
      toast({
        title: 'Success!',
        description: 'PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error saving PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to save PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [pdfDocument, file, pages, elements, toast, saveFileHistory]);

  const selectedElementData = elements.find(el => el.id === selectedElement);
  
  // Filter out deleted text blocks
  const visibleTextBlocks = textBlocks.filter(b => !deletedTextBlocks.has(b.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading PDF...</p>
          <p className="text-sm text-muted-foreground">This may take a moment for large files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] border border-border rounded-lg overflow-hidden bg-background">
      {/* Hidden file input for images */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* Toolbar */}
      <EditorToolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        zoom={zoom}
        onZoomChange={setZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToWidth={handleFitToWidth}
        onFitToPage={handleFitToPage}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={handleReset}
        hasSelection={!!selectedElement}
        isLocked={selectedElementData?.locked ?? false}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onToggleLock={handleToggleLock}
        onDownload={handleShowDownloadDialog}
        isProcessing={isProcessing}
        brushSettings={brushSettings}
        onBrushSettingsChange={setBrushSettings}
        eraserSettings={eraserSettings}
        onEraserSettingsChange={setEraserSettings}
      />
      
      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Page thumbnails */}
        <PageThumbnails
          pages={pages}
          currentPage={currentPage}
          onPageSelect={setCurrentPage}
          onRotatePage={handleRotatePage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onAddBlankPage={handleAddBlankPage}
          onReorderPages={handleReorderPages}
        />
        
        {/* Canvas with text selection layer */}
        <div className="flex-1 relative">
          <EditorCanvas
            pages={pages}
            currentPage={currentPage}
            elements={elements}
            selectedElement={selectedElement}
            activeTool={activeTool}
            zoom={zoom}
            brushSettings={brushSettings}
            eraserSettings={eraserSettings}
            onSelectElement={setSelectedElement}
            onAddElement={handleAddElement}
            onUpdateElement={handleUpdateElement}
            onElementsChange={setElements}
            onZoomChange={setZoom}
          />
          
          {/* Text selection overlay */}
          {textSelectionEnabled && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <TextSelectionLayer
                textBlocks={visibleTextBlocks}
                currentPage={currentPage}
                zoom={zoom}
                enabled={textSelectionEnabled && activeTool === 'select'}
                onTextDelete={handleTextDelete}
                onTextReplace={handleTextReplace}
              />
            </div>
          )}
        </div>
        
        {/* Properties panel with OCR */}
        <div className="w-64 bg-card border-l border-border overflow-y-auto">
          {/* OCR Panel */}
          <div className="p-2">
            <OCRPanel
              pdfType={pdfType}
              isProcessing={isOCRProcessing}
              progress={ocrProgress}
              textBlockCount={visibleTextBlocks.filter(b => b.pageIndex === currentPage).length}
              onRunOCR={handleRunOCR}
              onExtractText={handleExtractText}
              currentPage={currentPage}
              totalPages={pages.filter(p => !p.deleted).length}
            />
          </div>
          
          {/* Properties Panel */}
          <PropertiesPanel
            element={selectedElementData ?? null}
            onUpdate={handleUpdateElement}
          />
        </div>
      </div>
      
      {/* Watermark dialog */}
      <WatermarkDialog
        open={showWatermarkDialog}
        onOpenChange={setShowWatermarkDialog}
        onApply={handleApplyWatermark}
        currentPage={currentPage}
        totalPages={pages.filter(p => !p.deleted).length}
      />
      
      {/* Download preview dialog */}
      <DownloadPreviewDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        onConfirm={handleDownload}
        elements={elements}
        pages={pages}
        fileName={file.name}
        isProcessing={isProcessing}
      />
    </div>
  );
};
