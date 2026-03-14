import { useState, useRef, useEffect, useCallback } from "react";
import { Move, Type, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { pdfjsLib } from "@/lib/pdfWorker";

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  page: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  width: number;
  height: number;
}

interface PDFCanvasEditorProps {
  file: File;
  textElements: TextElement[];
  onTextElementsChange: (elements: TextElement[]) => void;
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
}

const FONT_FAMILIES = [
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times-Roman", label: "Times New Roman" },
  { value: "Courier", label: "Courier" },
];

const FONT_COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#FF0000", label: "Red" },
  { value: "#0000FF", label: "Blue" },
  { value: "#008000", label: "Green" },
  { value: "#800080", label: "Purple" },
  { value: "#FF6600", label: "Orange" },
];

export const PDFCanvasEditor = ({
  file,
  textElements,
  onTextElementsChange,
  selectedElement,
  onSelectElement,
}: PDFCanvasEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const [pageHeights, setPageHeights] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        
        const canvases: HTMLCanvasElement[] = [];
        const heights: number[] = [];
        
        // Determine scale based on container width
        const containerWidth = containerRef.current?.clientWidth || 600;
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });
        const newScale = Math.min((containerWidth - 40) / viewport.width, 1.5);
        setScale(newScale);
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const scaledViewport = page.getViewport({ scale: newScale });
          
          const canvas = document.createElement("canvas");
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;
          
          const ctx = canvas.getContext("2d")!;
          await page.render({
            canvasContext: ctx,
            viewport: scaledViewport,
          }).promise;
          
          canvases.push(canvas);
          heights.push(scaledViewport.height);
        }
        
        setPages(canvases);
        setPageHeights(heights);
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [file]);

  // Handle click on canvas to add text
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
    if (isDragging || isResizing) return;
    
    const target = e.target as HTMLElement;
    if (target.closest(".text-element")) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: "Click to edit",
      x,
      y,
      page: pageIndex,
      fontSize: 16,
      fontFamily: "Helvetica",
      color: "#000000",
      width: 150,
      height: 30,
    };
    
    onTextElementsChange([...textElements, newElement]);
    onSelectElement(newElement.id);
    setEditingElement(newElement.id);
  }, [textElements, onTextElementsChange, onSelectElement, isDragging, isResizing]);

  // Handle touch on canvas
  const handleCanvasTouch = useCallback((e: React.TouchEvent<HTMLDivElement>, pageIndex: number) => {
    if (isDragging || isResizing) return;
    
    const target = e.target as HTMLElement;
    if (target.closest(".text-element")) return;
    
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: "Click to edit",
      x,
      y,
      page: pageIndex,
      fontSize: 16,
      fontFamily: "Helvetica",
      color: "#000000",
      width: 150,
      height: 30,
    };
    
    onTextElementsChange([...textElements, newElement]);
    onSelectElement(newElement.id);
  }, [textElements, onTextElementsChange, onSelectElement, isDragging, isResizing]);

  // Start dragging
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    onSelectElement(elementId);
    
    const element = textElements.find(el => el.id === elementId);
    if (!element) return;
    
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    setDragOffset({
      x: clientX - element.x,
      y: clientY - element.y,
    });
  }, [textElements, onSelectElement]);

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !selectedElement) return;
    
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;
    
    onTextElementsChange(
      textElements.map(el =>
        el.id === selectedElement
          ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
          : el
      )
    );
  }, [isDragging, selectedElement, dragOffset, textElements, onTextElementsChange]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
      
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [isDragging, isResizing, handleDragMove, handleDragEnd]);

  // Handle resize
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    setIsResizing(true);
    onSelectElement(elementId);
  }, [onSelectElement]);

  const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing || !selectedElement) return;
    
    const element = textElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    let clientX: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const newWidth = Math.max(50, clientX - element.x);
    
    onTextElementsChange(
      textElements.map(el =>
        el.id === selectedElement
          ? { ...el, width: newWidth }
          : el
      )
    );
  }, [isResizing, selectedElement, textElements, onTextElementsChange]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("touchmove", handleResizeMove);
      
      return () => {
        window.removeEventListener("mousemove", handleResizeMove);
        window.removeEventListener("touchmove", handleResizeMove);
      };
    }
  }, [isResizing, handleResizeMove]);

  // Handle text editing
  const handleTextDoubleClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setEditingElement(elementId);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleTextChange = useCallback((elementId: string, newText: string) => {
    onTextElementsChange(
      textElements.map(el =>
        el.id === elementId ? { ...el, text: newText } : el
      )
    );
  }, [textElements, onTextElementsChange]);

  const handleTextBlur = useCallback(() => {
    setEditingElement(null);
  }, []);

  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    onTextElementsChange(textElements.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      onSelectElement(null);
    }
  }, [textElements, onTextElementsChange, selectedElement, onSelectElement]);

  // Update element property
  const updateElementProperty = useCallback((property: keyof TextElement, value: string | number) => {
    if (!selectedElement) return;
    
    onTextElementsChange(
      textElements.map(el =>
        el.id === selectedElement ? { ...el, [property]: value } : el
      )
    );
  }, [selectedElement, textElements, onTextElementsChange]);

  const selectedElementData = textElements.find(el => el.id === selectedElement);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {selectedElementData && (
        <div className="bg-card p-3 rounded-lg border border-border flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Font:</Label>
            <Select
              value={selectedElementData.fontFamily}
              onValueChange={(value) => updateElementProperty("fontFamily", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Size:</Label>
            <div className="flex items-center gap-2 w-32">
              <Slider
                value={[selectedElementData.fontSize]}
                onValueChange={([value]) => updateElementProperty("fontSize", value)}
                min={8}
                max={72}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-8">{selectedElementData.fontSize}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Color:</Label>
            <Select
              value={selectedElementData.color}
              onValueChange={(value) => updateElementProperty("color", value)}
            >
              <SelectTrigger className="w-28">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: selectedElementData.color }}
                  />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {FONT_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteElement(selectedElementData.id)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground">
        <Type className="w-4 h-4 inline mr-2" />
        Click anywhere on the PDF to add text. Drag to move, double-click to edit.
      </div>

      {/* Page navigation */}
      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {pages.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === pages.length - 1}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* PDF Canvas */}
      <div
        ref={containerRef}
        className="relative bg-muted/20 rounded-lg overflow-auto max-h-[600px] border border-border"
      >
        {pages.map((canvas, pageIndex) => (
          <div
            key={pageIndex}
            className={`relative ${pageIndex !== currentPage ? "hidden" : ""}`}
            style={{ width: canvas.width, height: canvas.height, margin: "0 auto" }}
            onClick={(e) => handleCanvasClick(e, pageIndex)}
            onTouchStart={(e) => {
              // Only trigger if not on existing element
              const target = e.target as HTMLElement;
              if (!target.closest(".text-element")) {
                handleCanvasTouch(e, pageIndex);
              }
            }}
          >
            <img
              src={canvas.toDataURL()}
              alt={`Page ${pageIndex + 1}`}
              className="pointer-events-none"
              draggable={false}
            />
            
            {/* Text elements for this page */}
            {textElements
              .filter(el => el.page === pageIndex)
              .map(element => (
                <div
                  key={element.id}
                  className={`text-element absolute cursor-move select-none ${
                    selectedElement === element.id
                      ? "ring-2 ring-primary ring-offset-1"
                      : "hover:ring-2 hover:ring-primary/50"
                  }`}
                  style={{
                    left: element.x,
                    top: element.y,
                    minWidth: element.width,
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    color: element.color,
                    padding: "2px 4px",
                    backgroundColor: selectedElement === element.id ? "rgba(255,255,255,0.9)" : "transparent",
                  }}
                  onMouseDown={(e) => handleDragStart(e, element.id)}
                  onTouchStart={(e) => handleDragStart(e, element.id)}
                  onDoubleClick={(e) => handleTextDoubleClick(e, element.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectElement(element.id);
                  }}
                >
                  {editingElement === element.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={element.text}
                      onChange={(e) => handleTextChange(element.id, e.target.value)}
                      onBlur={handleTextBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTextBlur();
                      }}
                      className="bg-white border-none outline-none w-full"
                      style={{
                        fontSize: element.fontSize,
                        fontFamily: element.fontFamily,
                        color: element.color,
                        minWidth: element.width,
                      }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        {selectedElement === element.id && (
                          <Move className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        )}
                        <span style={{ whiteSpace: "nowrap" }}>{element.text}</span>
                      </div>
                      {selectedElement === element.id && (
                        <div
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-full cursor-ew-resize bg-primary/20 hover:bg-primary/40"
                          onMouseDown={(e) => handleResizeStart(e, element.id)}
                          onTouchStart={(e) => handleResizeStart(e, element.id)}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Elements list */}
      {textElements.length > 0 && (
        <div className="bg-card p-4 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">
            Text Elements ({textElements.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-auto">
            {textElements.map((el) => (
              <div
                key={el.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                  selectedElement === el.id
                    ? "bg-primary/10 border border-primary"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
                onClick={() => {
                  onSelectElement(el.id);
                  setCurrentPage(el.page);
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{el.text}</span>
                  <span className="text-xs text-muted-foreground">
                    (Page {el.page + 1})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(el.id);
                  }}
                  className="text-destructive hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFCanvasEditor;
