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
  PageInfo, 
  Tool,
  ZOOM_LEVELS,
  BrushSettings,
  EraserSettings
} from './types';
import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { PageThumbnails } from './PageThumbnails';
import { WatermarkDialog } from './WatermarkDialog';
import { useEditorHistory } from './useEditorHistory';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

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
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  
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

  // Load PDF on mount
  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDocument(pdf);
        
        const loadedPages: PageInfo[] = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          
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
        
        setPages(loadedPages);
        saveToHistory();
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast({
          title: 'Error',
          description: 'Failed to load PDF file',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPDF();
  }, [file, toast]);

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
          case 'i': setActiveTool('image'); imageInputRef.current?.click(); break;
          case 'w': setActiveTool('watermark'); setShowWatermarkDialog(true); break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, undo, redo]);

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
    resetHistory();
    toast({ title: 'Reset', description: 'All changes have been reset' });
  }, [pages, resetHistory, toast]);

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
      width: 612 * 1.5, // Letter size at 1.5 scale
      height: 792 * 1.5,
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

  // Download PDF
  const handleDownload = useCallback(async () => {
    if (!pdfDocument) return;
    
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
        
        // Scale factor from canvas to PDF
        const scaleFactor = pageWidth / (pageInfo.width / 1.5);
        
        for (const element of pageElements) {
          if (element.type === 'text') {
            const textEl = element as TextElement;
            const font = fontMap[textEl.fontFamily] || helveticaFont;
            
            // Parse color
            const color = textEl.color.replace('#', '');
            const r = parseInt(color.substring(0, 2), 16) / 255;
            const g = parseInt(color.substring(2, 4), 16) / 255;
            const b = parseInt(color.substring(4, 6), 16) / 255;
            
            // Convert coordinates
            const x = textEl.x * scaleFactor;
            const y = pageHeight - (textEl.y * scaleFactor) - (textEl.fontSize * scaleFactor);
            
            page.drawText(textEl.text, {
              x,
              y,
              size: textEl.fontSize * scaleFactor,
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
              // Determine image type and embed
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
                // Tile the watermark
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
                // Center or diagonal
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
        onDownload={handleDownload}
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
        
        {/* Canvas */}
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
        
        {/* Properties panel */}
        <div className="w-64 bg-card border-l border-border overflow-hidden">
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
    </div>
  );
};
