import { useState, useCallback, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { useFileHistory } from '@/hooks/useFileHistory';
import { useIsMobile } from '@/hooks/use-mobile';
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
  EraserSettings,
  getPdfLibFontName,
  PDF_RENDER_SCALE,
} from './types';
import { getAlignedPdfTextPlacement } from './pdfTextAlignment';
import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { PageThumbnails } from './PageThumbnails';
import { WatermarkDialog } from './WatermarkDialog';
import { DownloadPreviewDialog } from './DownloadPreviewDialog';
import { OCRPanel } from './OCRPanel';
// TextSelectionLayer kept for backward compat but replaced by BlockHighlightLayer
import { useEditorHistory } from './useEditorHistory';
import { useOCR, OCRTextBlock } from './useOCR';
import { useTextBlocks, TextRegion, TextSegmentationMode } from './useTextBlocks';
import { BlockHighlightLayer } from './BlockHighlightLayer';
import { BlockEditPanel } from './BlockEditPanel';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanText, PanelRightOpen, Layers, AlertTriangle, Edit3 } from 'lucide-react';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Use scale from types
const MAX_FILE_SIZE_MB = 25;

interface ProfessionalPDFEditorProps {
  file: File;
  onClose: () => void;
}

export const ProfessionalPDFEditor = ({ file, onClose }: ProfessionalPDFEditorProps) => {
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();
  const isMobile = useIsMobile();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [showMobilePages, setShowMobilePages] = useState(false);
  
  // Core state
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [elements, setElements] = useState<AnyElement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(isMobile ? 0.3 : 0.75);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWatermarkDialog, setShowWatermarkDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [fileSizeError, setFileSizeError] = useState(false);
  
  // OCR and text selection state
  const [pdfType, setPdfType] = useState<'text-based' | 'scanned' | 'mixed' | null>(null);
  const [textSelectionEnabled, setTextSelectionEnabled] = useState(false);
  const [deletedTextBlocks, setDeletedTextBlocks] = useState<Set<string>>(new Set());
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'properties' | 'blocks'>('blocks');
  const [segmentationMode, setSegmentationMode] = useState<TextSegmentationMode>('auto');
  
  // OCR hook
  const { 
    isProcessing: isOCRProcessing, 
    progress: ocrProgress, 
    textBlocks, 
    stats: ocrStats,
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

  // File size check
  useEffect(() => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setFileSizeError(true);
      setIsLoading(false);
      toast({
        title: 'File too large',
        description: `Maximum file size is ${MAX_FILE_SIZE_MB}MB. Your file is ${sizeMB.toFixed(1)}MB.`,
        variant: 'destructive',
      });
    }
  }, [file, toast]);

  // Load PDF on mount
  useEffect(() => {
    if (fileSizeError) return;
    let isCancelled = false;
    
    const loadPDF = async () => {
      setIsLoading(true);
      setLoadProgress(5);
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (isCancelled) return;
        setLoadProgress(15);
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (isCancelled) return;
        setLoadProgress(25);
        
        setPdfDocument(pdf);
        
        const loadedPages: PageInfo[] = [];
        const totalPages = pdf.numPages;
        
        for (let i = 1; i <= totalPages; i++) {
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
            dataUrl: canvas.toDataURL('image/jpeg', 0.92),
            width: viewport.width,
            height: viewport.height,
          });
          
          setLoadProgress(25 + Math.round((i / totalPages) * 60));
        }
        
        if (isCancelled) return;
        
        setPages(loadedPages);
        
        // Auto-fit to viewport on mobile after pages load
        if (isMobile && loadedPages.length > 0) {
          setTimeout(() => {
            const firstPage = loadedPages[0];
            const viewportWidth = window.innerWidth - 32; // account for padding
            const fitZoom = Math.min(0.8, Math.max(0.2, viewportWidth / firstPage.width));
            setZoom(fitZoom);
          }, 100);
        }
        
        setLoadProgress(90);
        
        // Detect PDF type
        const type = await detectPDFType(pdf, 0);
        if (isCancelled) return;
        
        setPdfType(type);
        
        // Auto-extract text for text-based PDFs
        if (type === 'text-based' || type === 'mixed') {
          try {
            await extractPDFText(pdf, 0);
            setTextSelectionEnabled(true);
          } catch (err) {
            console.error('Auto text extraction failed:', err);
          }
        }
        
        setLoadProgress(100);
        
        toast({
          title: 'PDF Loaded',
          description: `${type === 'text-based' ? 'Text-based' : type === 'scanned' ? 'Scanned/Image' : 'Mixed'} PDF detected. ${totalPages} page(s).${type !== 'scanned' ? ' Text auto-extracted for editing.' : ' Use OCR to detect text.'}`,
        });
      } catch (error) {
        if (isCancelled) return;
        console.error('Error loading PDF:', error);
        toast({
          title: 'Error',
          description: 'Failed to load PDF file. The file may be corrupted or password-protected.',
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
  }, [file, fileSizeError]);

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
      
      if (!e.ctrlKey && !e.metaKey && !document.activeElement?.closest('input, textarea')) {
        // Page navigation with arrow keys
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          setCurrentPage(prev => Math.max(0, prev - 1));
          return;
        }
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          e.preventDefault();
          setCurrentPage(prev => Math.min(pages.filter(p => !p.deleted).length - 1, prev + 1));
          return;
        }

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

  // Auto-extract text when changing pages (for text-based PDFs)
  useEffect(() => {
    if (!pdfDocument || !textSelectionEnabled) return;
    const pageBlocks = textBlocks.filter(b => b.pageIndex === currentPage);
    if (pageBlocks.length > 0) return; // already extracted
    if (pdfType === 'text-based' || pdfType === 'mixed') {
      extractPDFText(pdfDocument, currentPage).catch(() => {});
    }
    // Reset selected region when changing pages
    setSelectedRegionId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pdfDocument, textSelectionEnabled, pdfType]);

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
      // Support English + Telugu
      await performOCR(currentPageData.canvas, currentPage, 'eng+tel');
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
    const redactElement: RedactElement = {
      id: `redact-${Date.now()}`,
      type: 'redact',
      page: originalBlock.pageIndex,
      x: originalBlock.x - 2,
      y: originalBlock.y - 1,
      width: originalBlock.width + 6,
      height: originalBlock.height + 4,
      rotation: 0,
      opacity: 1,
      locked: false,
      zIndex: elements.length,
      fillColor: '#FFFFFF',
    };
    
    // Use the exact font size from the OCR block (already in canvas px)
    const replaceFontSize = originalBlock.height;
    const textElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      page: originalBlock.pageIndex,
      x: originalBlock.x,
      y: originalBlock.y,
      width: Math.max(originalBlock.width, newText.length * (replaceFontSize * 0.6)),
      height: replaceFontSize,
      rotation: 0,
      opacity: 1,
      locked: false,
      zIndex: elements.length + 1,
      text: newText,
      fontSize: replaceFontSize,
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#000000',
      backgroundMask: true, // Auto-enable white mask for clean replacement
    };
    
    setElements(prev => [...prev, redactElement, textElement]);
    setDeletedTextBlocks(prev => new Set(prev).add(blockId));
    saveToHistory();
    
    toast({
      title: 'Text Replaced',
      description: 'New text added with white mask. Adjust style in Properties panel.',
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
    // Compute zoom that fits the current page width into the available viewport
    const currentPageData = pages[currentPage];
    const container = editorContainerRef.current;
    if (currentPageData && container) {
      // Available width: container minus sidebar widths, minus padding
      const sidebarWidth = isMobile ? 0 : (40 * 4 + 64 * 4); // ~pages + properties panel
      const availableWidth = container.clientWidth - (isMobile ? 16 : 48);
      const fitZoom = Math.min(1.5, Math.max(0.2, availableWidth / currentPageData.width));
      setZoom(fitZoom);
    } else {
      setZoom(1);
    }
  }, [pages, currentPage, isMobile]);

  const handleFitToPage = useCallback(() => {
    const currentPageData = pages[currentPage];
    const container = editorContainerRef.current;
    if (currentPageData && container) {
      const availableWidth = container.clientWidth - (isMobile ? 16 : 48);
      const availableHeight = container.clientHeight - (isMobile ? 80 : 48);
      const fitZoom = Math.min(
        availableWidth / currentPageData.width,
        availableHeight / currentPageData.height,
        1.5
      );
      setZoom(Math.max(0.2, fitZoom));
    } else {
      setZoom(0.75);
    }
  }, [pages, currentPage, isMobile]);

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
    
    const imgFile = files[0];
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
    
    reader.readAsDataURL(imgFile);
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
      
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
      const courierBoldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
      
      const getFontForElement = (family: string, weight: string) => {
        const isBold = weight === 'bold' || weight === 'semibold';
        const pdfFontName = getPdfLibFontName(family);
        if (pdfFontName === 'Courier') return isBold ? courierBoldFont : courierFont;
        if (pdfFontName === 'Times-Roman') return isBold ? timesBoldFont : timesFont;
        return isBold ? helveticaBoldFont : helveticaFont;
      };
      
      for (let i = 0; i < pdfPages.length; i++) {
        const pageInfo = pages[i];
        if (!pageInfo || pageInfo.deleted) continue;
        
        const page = pdfPages[i];
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        if (pageInfo.rotation !== 0) {
          page.setRotation({ angle: pageInfo.rotation, type: 'degrees' } as any);
        }
        
        const pageElements = elements.filter(el => 
          el.page === i || (el.type === 'watermark' && (el as WatermarkElement).applyTo === 'all')
        );
        
        const scaleFactor = pageWidth / pageInfo.width;
        
        for (const element of pageElements) {
          if (element.type === 'text') {
            const textEl = element as TextElement;
            const font = getFontForElement(textEl.fontFamily, textEl.fontWeight);
            
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

            // Draw white background mask if enabled
            if (textEl.backgroundMask) {
              const maskX = textEl.x * scaleFactor - 1;
              const lineH = textEl.fontSize * scaleFactor * (textEl.lineHeightMultiplier ?? 1);
              const maskY = pageHeight - (textEl.y * scaleFactor) - lineH;
              const maskW = textEl.width * scaleFactor + 2;
              const maskH = lineH + 2;
              page.drawRectangle({
                x: maskX,
                y: maskY,
                width: maskW,
                height: maskH,
                color: rgb(1, 1, 1),
                opacity: 1,
              });
            }

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
                x, y, width, height,
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
                x, y,
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
              const font = getFontForElement(wmEl.fontFamily || 'Helvetica', 'normal');
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
                      x: tx, y: ty,
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
                  x, y,
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
              x, y,
              width: redactEl.width * scaleFactor,
              height: redactEl.height * scaleFactor,
              color: rgb(fr, fg, fb),
              opacity: redactEl.opacity,
            });
          }
        }
      }
      
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
  
  const visibleTextBlocks = textBlocks.filter(b => !deletedTextBlocks.has(b.id));
  
  // Block-based text regions
  const { regions, modeUsed } = useTextBlocks(textBlocks, deletedTextBlocks, currentPage, segmentationMode);

  // Block-level replace: cover selected region and place replacement text anchored to that same region
  const handleRegionReplace = useCallback((region: TextRegion, newText: string) => {
    const cleanText = newText.trimEnd();
    if (!cleanText) {
      toast({
        title: 'Replacement text required',
        description: 'Enter text to replace this block, or use Delete to remove it.',
        variant: 'destructive',
      });
      return;
    }

    const fontSize = Math.max(9, Math.round(avgHeight));
    const lineHeightMultiplier = 1.2;
    const lineCount = Math.max(1, cleanText.split(/\r?\n/).length);
    const estimatedTextHeight = Math.max(region.height, fontSize * lineHeightMultiplier * lineCount);

    const redactElement: RedactElement = {
      id: `redact-region-${Date.now()}`,
      type: 'redact',
      page: region.pageIndex,
      x: region.x - 2,
      y: region.y - 1,
      width: region.width + 6,
      height: Math.max(region.height + 4, estimatedTextHeight + 2),
      rotation: 0,
      opacity: 1,
      locked: false,
      zIndex: 0,
      fillColor: '#FFFFFF',
    };

    const textElement: TextElement = {
      id: `text-region-${Date.now()}`,
      type: 'text',
      page: region.pageIndex,
      x: region.x,
      y: region.y,
      width: Math.max(region.width, 40),
      height: estimatedTextHeight,
      rotation: 0,
      opacity: 1,
      locked: false,
      zIndex: 0,
      text: cleanText,
      fontSize,
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#000000',
      lineHeightMultiplier,
      backgroundMask: true,
    };

    setElements(prev => {
      const baseZIndex = prev.length;
      return [
        ...prev,
        { ...redactElement, zIndex: baseZIndex },
        { ...textElement, zIndex: baseZIndex + 1 },
      ];
    });

    setDeletedTextBlocks(prev => {
      const next = new Set(prev);
      region.sourceBlocks.forEach(block => next.add(block.id));
      return next;
    });

    setSelectedRegionId(null);
    saveToHistory();

    toast({
      title: 'Block Replaced',
      description: 'Only the selected region was replaced with matched block styling.',
    });
  }, [handleRegionDelete, saveToHistory, toast]);

  const handleRegionDelete = useCallback((region: TextRegion) => {
    const redactElement: RedactElement = {
      id: `redact-region-${Date.now()}`,
      type: 'redact',
      page: region.pageIndex,
      x: region.x - 2,
      y: region.y - 1,
      width: region.width + 6,
      height: region.height + 4,
      rotation: 0,
      opacity: 1,
      locked: false,
      zIndex: elements.length,
      fillColor: '#FFFFFF',
    };

    setElements(prev => [...prev, redactElement]);
    setDeletedTextBlocks(prev => {
      const next = new Set(prev);
      region.sourceBlocks.forEach(b => next.add(b.id));
      return next;
    });
    setSelectedRegionId(null);
    saveToHistory();

    toast({
      title: 'Block Deleted',
      description: 'Text block removed with white cover.',
    });
  }, [elements.length, saveToHistory, toast]);

  // File size error
  if (fileSizeError) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h3 className="text-lg font-semibold">File Too Large</h3>
          <p className="text-muted-foreground">
            Maximum file size is {MAX_FILE_SIZE_MB}MB. Your file is {(file.size / (1024 * 1024)).toFixed(1)}MB.
          </p>
          <Button onClick={onClose}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/30 rounded-lg">
        <div className="text-center space-y-4 w-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading PDF...</p>
          <Progress value={loadProgress} className="h-2" />
          <p className="text-sm text-muted-foreground">{loadProgress}% complete</p>
        </div>
      </div>
    );
  }

  const rightPanelContent = (
    <Tabs value={activePanel} onValueChange={(v) => setActivePanel(v as 'properties' | 'blocks')} className="flex flex-col h-full">
      <TabsList className="grid w-full grid-cols-2 m-1.5 mb-0">
        <TabsTrigger value="blocks" className="text-xs gap-1">
          <Edit3 className="w-3 h-3" />
          Edit Text
        </TabsTrigger>
        <TabsTrigger value="properties" className="text-xs gap-1">
          <ScanText className="w-3 h-3" />
          OCR & Props
        </TabsTrigger>
      </TabsList>
      <TabsContent value="blocks" className="flex-1 overflow-hidden m-0">
        <BlockEditPanel
          regions={regions}
          selectedRegion={selectedRegionId}
          onSelectRegion={setSelectedRegionId}
          onReplaceRegion={handleRegionReplace}
          onDeleteRegion={handleRegionDelete}
        />
      </TabsContent>
      <TabsContent value="properties" className="flex-1 overflow-y-auto m-0">
        <div className="p-2">
          <OCRPanel
            pdfType={pdfType}
            isProcessing={isOCRProcessing}
            progress={ocrProgress}
            textBlockCount={visibleTextBlocks.filter(b => b.pageIndex === currentPage).length}
            stats={ocrStats}
            segmentationMode={segmentationMode}
            resolvedSegmentationMode={modeUsed}
            onSegmentationModeChange={setSegmentationMode}
            onRunOCR={handleRunOCR}
            onExtractText={handleExtractText}
            currentPage={currentPage}
            totalPages={pages.filter(p => !p.deleted).length}
          />
        </div>
        <PropertiesPanel
          element={selectedElementData ?? null}
          onUpdate={handleUpdateElement}
        />
      </TabsContent>
    </Tabs>
  );

  return (
    <div 
      ref={editorContainerRef}
      className="flex flex-col h-[calc(100vh-200px)] min-h-[400px] md:min-h-[600px] border border-border rounded-lg overflow-hidden bg-background"
    >
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

      {/* Mobile floating action buttons */}
      {isMobile && (
        <div className="flex items-center gap-2 p-2 bg-card border-b border-border">
          <Sheet open={showMobilePages} onOpenChange={setShowMobilePages}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Layers className="w-4 h-4" />
                Pages
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0 overflow-y-auto">
              <div className="pt-10">
                <PageThumbnails
                  pages={pages}
                  currentPage={currentPage}
                  onPageSelect={(p) => { setCurrentPage(p); setShowMobilePages(false); }}
                  onRotatePage={handleRotatePage}
                  onDeletePage={handleDeletePage}
                  onDuplicatePage={handleDuplicatePage}
                  onAddBlankPage={handleAddBlankPage}
                  onReorderPages={handleReorderPages}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          <Sheet open={showMobilePanel} onOpenChange={setShowMobilePanel}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit3 className="w-4 h-4" />
                Edit Text
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 overflow-y-auto">
              <div className="pt-10">
                {rightPanelContent}
              </div>
            </SheetContent>
          </Sheet>
          
          <span className="text-xs text-muted-foreground ml-auto">
            Page {currentPage + 1}/{pages.filter(p => !p.deleted).length}
          </span>
        </div>
      )}
      
      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Page thumbnails - desktop only */}
        {!isMobile && (
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
        )}
        
        {/* Canvas with block highlight overlay and page nav */}
        <div className="flex-1 relative overflow-hidden min-w-0 flex flex-col">
          <div className="flex-1 overflow-hidden">
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
              textOverlay={
                textSelectionEnabled ? (
                  <BlockHighlightLayer
                    regions={regions}
                    selectedRegion={selectedRegionId}
                    enabled={textSelectionEnabled && activeTool === 'select'}
                    onSelectRegion={(id) => {
                      setSelectedRegionId(id);
                      if (id) setActivePanel('blocks');
                    }}
                  />
                ) : null
              }
            />
          </div>
          
          {/* Quick page navigation bar */}
          {pages.filter(p => !p.deleted).length > 1 && (
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-card border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              >
                ← Prev
              </Button>
              <div className="flex gap-1 max-w-[300px] overflow-x-auto">
                {pages.filter(p => !p.deleted).map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-7 h-7 rounded text-xs font-medium transition-all ${
                      idx === currentPage
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => setCurrentPage(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={currentPage >= pages.filter(p => !p.deleted).length - 1}
                onClick={() => setCurrentPage(prev => Math.min(pages.filter(p => !p.deleted).length - 1, prev + 1))}
              >
                Next →
              </Button>
            </div>
          )}
        </div>
        
        {/* Properties panel with OCR - desktop only */}
        {!isMobile && (
          <div className="w-64 bg-card border-l border-border overflow-y-auto">
            {rightPanelContent}
          </div>
        )}
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
