import { memo, useRef, useEffect, useState, useCallback } from 'react';
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
  Point,
  BrushSettings,
  EraserSettings
} from './types';

interface EditorCanvasProps {
  pages: PageInfo[];
  currentPage: number;
  elements: AnyElement[];
  selectedElement: string | null;
  activeTool: Tool;
  zoom: number;
  brushSettings: BrushSettings;
  eraserSettings: EraserSettings;
  onSelectElement: (id: string | null) => void;
  onAddElement: (element: AnyElement) => void;
  onUpdateElement: (id: string, updates: Partial<AnyElement>) => void;
  onElementsChange: (elements: AnyElement[]) => void;
  onZoomChange: (zoom: number) => void;
  /** Render prop for text selection overlay inside the scaled container */
  textOverlay?: React.ReactNode;
}

export const EditorCanvas = memo(({
  pages,
  currentPage,
  elements,
  selectedElement,
  activeTool,
  zoom,
  brushSettings,
  eraserSettings,
  onSelectElement,
  onAddElement,
  onUpdateElement,
  onElementsChange,
  onZoomChange,
  textOverlay,
}: EditorCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState<Point>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState<Point>({ x: 0, y: 0 });
  const [currentDrawing, setCurrentDrawing] = useState<Point[]>([]);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [tempShape, setTempShape] = useState<ShapeElement | null>(null);
  const [tempRedact, setTempRedact] = useState<RedactElement | null>(null);
  
  const currentPageData = pages[currentPage];
  const pageElements = elements.filter(el => el.page === currentPage || (el.type === 'watermark' && (el as WatermarkElement).applyTo === 'all'));
  
  // Mouse wheel zoom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.25, Math.min(3, zoom + delta));
        onZoomChange(newZoom);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, onZoomChange]);

  // Touch pinch zoom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let initialDistance = 0;
    let initialZoom = zoom;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.hypot(dx, dy);
        initialZoom = zoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.hypot(dx, dy);
        const scale = distance / initialDistance;
        const newZoom = Math.max(0.25, Math.min(3, initialZoom * scale));
        onZoomChange(newZoom);
      }
    };

    const handleTouchEnd = () => {
      initialDistance = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom, onZoomChange]);

  /**
   * CRITICAL FIX: Get mouse position in the UNSCALED coordinate system.
   * The container uses CSS transform: scale(zoom), so we need to divide by zoom
   * to get coordinates in the original PDF render space.
   */
  const getMousePosition = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Since container is scaled via CSS transform: scale(zoom),
    // getBoundingClientRect() gives us the SCALED size.
    // We divide by zoom to get unscaled coordinates.
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    };
  }, [zoom]);

  // Pan tool handlers
  const handlePanStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length !== 1) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setPanStart({ x: clientX, y: clientY });
    setScrollStart({ x: scrollContainer.scrollLeft, y: scrollContainer.scrollTop });
    setIsPanning(true);
  }, []);

  const handlePanMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isPanning) return;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length !== 1) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const dx = panStart.x - clientX;
    const dy = panStart.y - clientY;
    
    scrollContainer.scrollLeft = scrollStart.x + dx;
    scrollContainer.scrollTop = scrollStart.y + dy;
  }, [isPanning, panStart, scrollStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handlePanMove);
      window.addEventListener('mouseup', handlePanEnd);
      window.addEventListener('touchmove', handlePanMove, { passive: true });
      window.addEventListener('touchend', handlePanEnd);
      return () => {
        window.removeEventListener('mousemove', handlePanMove);
        window.removeEventListener('mouseup', handlePanEnd);
        window.removeEventListener('touchmove', handlePanMove);
        window.removeEventListener('touchend', handlePanEnd);
      };
    }
  }, [isPanning, handlePanMove, handlePanEnd]);

  // Eraser function
  const eraseAtPoint = useCallback((pos: Point) => {
    const eraserRadius = eraserSettings.size / 2;
    
    const updatedElements = elements.filter(el => {
      if (el.type !== 'drawing' || el.page !== currentPage) return true;
      
      const drawEl = el as DrawingElement;
      const hitPoint = drawEl.points.some(p => {
        const dx = (p.x + drawEl.x) - pos.x;
        const dy = (p.y + drawEl.y) - pos.y;
        return Math.hypot(dx, dy) < eraserRadius;
      });
      
      return !hitPoint;
    });

    if (updatedElements.length !== elements.length) {
      onElementsChange(updatedElements);
    }
  }, [elements, currentPage, eraserSettings.size, onElementsChange]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getMousePosition(e);
    
    if (activeTool === 'pan') {
      handlePanStart(e);
      return;
    }

    if (activeTool === 'eraser') {
      setIsDrawing(true);
      eraseAtPoint(pos);
      return;
    }
    
    const target = e.target as HTMLElement;
    if (target.closest('.editor-element')) return;
    
    onSelectElement(null);
    
    if (activeTool === 'text') {
      const newElement: TextElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        page: currentPage,
        x: pos.x,
        y: pos.y,
        width: 150,
        height: 30,
        rotation: 0,
        opacity: 1,
        locked: false,
        zIndex: elements.length,
        text: 'Click to edit',
        fontSize: 16,
        fontFamily: 'Helvetica',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#000000',
      };
      onAddElement(newElement);
      onSelectElement(newElement.id);
      setEditingText(newElement.id);
    } else if (['rectangle', 'circle', 'line', 'arrow'].includes(activeTool)) {
      setShapeStart(pos);
      setTempShape({
        id: `shape-${Date.now()}`,
        type: 'shape',
        shapeType: activeTool as 'rectangle' | 'circle' | 'line' | 'arrow',
        page: currentPage,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: 1,
        locked: false,
        zIndex: elements.length,
        strokeColor: '#000000',
        fillColor: 'transparent',
        strokeWidth: 2,
      });
    } else if (activeTool === 'redact') {
      setShapeStart(pos);
      setTempRedact({
        id: `redact-${Date.now()}`,
        type: 'redact',
        page: currentPage,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: 1,
        locked: false,
        zIndex: elements.length,
        fillColor: '#FFFFFF',
      });
    } else if (['pen', 'highlight', 'underline', 'brush'].includes(activeTool)) {
      setIsDrawing(true);
      setCurrentDrawing([pos]);
    }
  }, [activeTool, currentPage, elements.length, getMousePosition, onAddElement, onSelectElement, handlePanStart, eraseAtPoint]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getMousePosition(e);
    
    if (shapeStart && tempShape) {
      const width = pos.x - shapeStart.x;
      const height = pos.y - shapeStart.y;
      setTempShape({
        ...tempShape,
        width: Math.abs(width),
        height: Math.abs(height),
        x: width < 0 ? pos.x : shapeStart.x,
        y: height < 0 ? pos.y : shapeStart.y,
        endX: pos.x,
        endY: pos.y,
      });
    }
    
    if (shapeStart && tempRedact) {
      const width = pos.x - shapeStart.x;
      const height = pos.y - shapeStart.y;
      setTempRedact({
        ...tempRedact,
        width: Math.abs(width),
        height: Math.abs(height),
        x: width < 0 ? pos.x : shapeStart.x,
        y: height < 0 ? pos.y : shapeStart.y,
      });
    }
    
    if (isDrawing) {
      if (activeTool === 'eraser') {
        eraseAtPoint(pos);
      } else {
        setCurrentDrawing(prev => [...prev, pos]);
      }
    }
  }, [getMousePosition, isDrawing, shapeStart, tempShape, tempRedact, activeTool, eraseAtPoint]);

  const handleCanvasMouseUp = useCallback(() => {
    if (tempShape && shapeStart) {
      if (tempShape.width > 5 || tempShape.height > 5) {
        onAddElement(tempShape);
        onSelectElement(tempShape.id);
      }
      setTempShape(null);
      setShapeStart(null);
    }
    
    if (tempRedact && shapeStart) {
      if (tempRedact.width > 5 || tempRedact.height > 5) {
        onAddElement(tempRedact);
        onSelectElement(tempRedact.id);
      }
      setTempRedact(null);
      setShapeStart(null);
    }
    
    if (isDrawing && currentDrawing.length > 1 && activeTool !== 'eraser') {
      const bounds = currentDrawing.reduce(
        (acc, p) => ({
          minX: Math.min(acc.minX, p.x),
          minY: Math.min(acc.minY, p.y),
          maxX: Math.max(acc.maxX, p.x),
          maxY: Math.max(acc.maxY, p.y),
        }),
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );

      const isBrush = activeTool === 'brush';
      
      const drawing: DrawingElement = {
        id: `drawing-${Date.now()}`,
        type: 'drawing',
        page: currentPage,
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        rotation: 0,
        opacity: isBrush ? brushSettings.opacity : (activeTool === 'highlight' ? 0.4 : 1),
        locked: false,
        zIndex: elements.length,
        points: currentDrawing.map(p => ({ x: p.x - bounds.minX, y: p.y - bounds.minY })),
        strokeColor: isBrush ? brushSettings.color : (activeTool === 'highlight' ? '#FFFF00' : activeTool === 'underline' ? '#FF0000' : '#000000'),
        strokeWidth: isBrush ? brushSettings.size : (activeTool === 'highlight' ? 20 : activeTool === 'underline' ? 3 : 2),
        drawingType: activeTool as 'pen' | 'highlight' | 'underline' | 'brush',
      };
      onAddElement(drawing);
    }
    
    setIsDrawing(false);
    setCurrentDrawing([]);
  }, [activeTool, currentDrawing, currentPage, elements.length, isDrawing, onAddElement, onSelectElement, shapeStart, tempShape, tempRedact, brushSettings]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const pos = getMousePosition(e);
      
      if (activeTool === 'pan') {
        handlePanStart(e);
        return;
      }

      if (activeTool === 'eraser') {
        setIsDrawing(true);
        eraseAtPoint(pos);
        return;
      }

      if (['pen', 'highlight', 'underline', 'brush'].includes(activeTool)) {
        setIsDrawing(true);
        setCurrentDrawing([pos]);
      }
    }
  }, [activeTool, getMousePosition, handlePanStart, eraseAtPoint]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDrawing) {
      const pos = getMousePosition(e);
      if (activeTool === 'eraser') {
        eraseAtPoint(pos);
      } else {
        setCurrentDrawing(prev => [...prev, pos]);
      }
    }
  }, [isDrawing, getMousePosition, activeTool, eraseAtPoint]);

  const handleTouchEnd = useCallback(() => {
    handleCanvasMouseUp();
  }, [handleCanvasMouseUp]);

  // Element drag handlers
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || element.locked) return;
    
    onSelectElement(elementId);
    const pos = getMousePosition(e);
    setDragStart(pos);
    setElementStart({ x: element.x, y: element.y });
    setIsDragging(true);
  }, [elements, getMousePosition, onSelectElement]);

  const handleElementDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const pos = {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
    
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    
    onUpdateElement(selectedElement, {
      x: Math.max(0, elementStart.x + dx),
      y: Math.max(0, elementStart.y + dy),
    });
  }, [dragStart, elementStart, isDragging, onUpdateElement, selectedElement, zoom]);

  const handleElementDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleElementDrag);
      window.addEventListener('mouseup', handleElementDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleElementDrag);
        window.removeEventListener('mouseup', handleElementDragEnd);
      };
    }
  }, [isDragging, handleElementDrag, handleElementDragEnd]);

  // Handle text editing
  const handleTextDoubleClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setEditingText(elementId);
  }, []);

  const handleTextChange = useCallback((elementId: string, text: string) => {
    onUpdateElement(elementId, { text });
  }, [onUpdateElement]);

  const handleTextBlur = useCallback(() => {
    setEditingText(null);
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    onSelectElement(elementId);
    setIsResizing(true);
    setDragStart(getMousePosition(e));
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setElementStart({ x: element.width, y: element.height });
    }
  }, [elements, getMousePosition, onSelectElement]);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing || !selectedElement) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const pos = {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
    
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    
    onUpdateElement(selectedElement, {
      width: Math.max(20, elementStart.x + dx),
      height: Math.max(20, elementStart.y + dy),
    });
  }, [dragStart, elementStart, isResizing, onUpdateElement, selectedElement, zoom]);

  useEffect(() => {
    if (isResizing) {
      const endResize = () => setIsResizing(false);
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', endResize);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', endResize);
      };
    }
  }, [isResizing, handleResize]);

  const renderElement = useCallback((element: AnyElement) => {
    const isSelected = selectedElement === element.id;
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      cursor: element.locked ? 'not-allowed' : (activeTool === 'select' ? 'move' : 'default'),
      zIndex: element.zIndex,
    };

    switch (element.type) {
      case 'text': {
        const textEl = element as TextElement;
        return (
          <div
            key={element.id}
            className={`editor-element ${isSelected ? 'ring-2 ring-primary' : ''}`}
            style={{
              ...baseStyle,
              fontFamily: textEl.fontFamily,
              fontSize: textEl.fontSize,
              fontWeight: textEl.fontWeight,
              fontStyle: textEl.fontStyle,
              textDecoration: textEl.textDecoration,
              color: textEl.color,
              minWidth: 50,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
            onDoubleClick={(e) => handleTextDoubleClick(e, element.id)}
          >
            {editingText === element.id ? (
              <input
                type="text"
                value={textEl.text}
                onChange={(e) => handleTextChange(element.id, e.target.value)}
                onBlur={handleTextBlur}
                autoFocus
                className="bg-transparent border-none outline-none w-full"
                style={{
                  fontFamily: textEl.fontFamily,
                  fontSize: textEl.fontSize,
                  fontWeight: textEl.fontWeight,
                  fontStyle: textEl.fontStyle,
                  color: textEl.color,
                }}
              />
            ) : (
              textEl.text
            )}
            {isSelected && !element.locked && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize"
                onMouseDown={(e) => handleResizeStart(e, element.id)}
              />
            )}
          </div>
        );
      }
      
      case 'shape': {
        const shapeEl = element as ShapeElement;
        return (
          <div
            key={element.id}
            className={`editor-element ${isSelected ? 'ring-2 ring-primary' : ''}`}
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          >
            <svg width="100%" height="100%" className="overflow-visible">
              {shapeEl.shapeType === 'rectangle' && (
                <rect
                  x={shapeEl.strokeWidth / 2}
                  y={shapeEl.strokeWidth / 2}
                  width={shapeEl.width - shapeEl.strokeWidth}
                  height={shapeEl.height - shapeEl.strokeWidth}
                  stroke={shapeEl.strokeColor}
                  fill={shapeEl.fillColor}
                  strokeWidth={shapeEl.strokeWidth}
                />
              )}
              {shapeEl.shapeType === 'circle' && (
                <ellipse
                  cx={shapeEl.width / 2}
                  cy={shapeEl.height / 2}
                  rx={(shapeEl.width - shapeEl.strokeWidth) / 2}
                  ry={(shapeEl.height - shapeEl.strokeWidth) / 2}
                  stroke={shapeEl.strokeColor}
                  fill={shapeEl.fillColor}
                  strokeWidth={shapeEl.strokeWidth}
                />
              )}
              {shapeEl.shapeType === 'line' && (
                <line
                  x1={0}
                  y1={0}
                  x2={shapeEl.width}
                  y2={shapeEl.height}
                  stroke={shapeEl.strokeColor}
                  strokeWidth={shapeEl.strokeWidth}
                />
              )}
              {shapeEl.shapeType === 'arrow' && (
                <>
                  <line
                    x1={0}
                    y1={shapeEl.height / 2}
                    x2={shapeEl.width - 10}
                    y2={shapeEl.height / 2}
                    stroke={shapeEl.strokeColor}
                    strokeWidth={shapeEl.strokeWidth}
                  />
                  <polygon
                    points={`${shapeEl.width},${shapeEl.height / 2} ${shapeEl.width - 15},${shapeEl.height / 2 - 8} ${shapeEl.width - 15},${shapeEl.height / 2 + 8}`}
                    fill={shapeEl.strokeColor}
                  />
                </>
              )}
            </svg>
            {isSelected && !element.locked && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize"
                onMouseDown={(e) => handleResizeStart(e, element.id)}
              />
            )}
          </div>
        );
      }
      
      case 'image': {
        const imgEl = element as ImageElement;
        return (
          <div
            key={element.id}
            className={`editor-element ${isSelected ? 'ring-2 ring-primary' : ''}`}
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          >
            <img
              src={imgEl.src}
              alt="Uploaded"
              className="w-full h-full object-contain"
              draggable={false}
            />
            {isSelected && !element.locked && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize"
                onMouseDown={(e) => handleResizeStart(e, element.id)}
              />
            )}
          </div>
        );
      }
      
      case 'drawing': {
        const drawEl = element as DrawingElement;
        const pathData = drawEl.points.reduce((acc, point, i) => {
          return acc + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
        }, '');
        
        return (
          <div
            key={element.id}
            className={`editor-element ${isSelected ? 'ring-2 ring-primary' : ''}`}
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          >
            <svg width="100%" height="100%" className="overflow-visible">
              <path
                d={pathData}
                stroke={drawEl.strokeColor}
                strokeWidth={drawEl.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      }
      
      case 'watermark': {
        const wmEl = element as WatermarkElement;
        return (
          <div
            key={element.id}
            className={`editor-element pointer-events-none ${isSelected ? 'ring-2 ring-primary pointer-events-auto' : ''}`}
            style={{
              ...baseStyle,
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${wmEl.rotation}deg)`,
              width: 'auto',
              height: 'auto',
            }}
          >
            {wmEl.watermarkType === 'text' ? (
              <span
                style={{
                  fontFamily: wmEl.fontFamily,
                  fontSize: wmEl.fontSize,
                  color: wmEl.color,
                  whiteSpace: 'nowrap',
                }}
              >
                {wmEl.text}
              </span>
            ) : (
              <img
                src={wmEl.imageSrc}
                alt="Watermark"
                className="max-w-[200px] max-h-[200px]"
              />
            )}
          </div>
        );
      }
      
      case 'redact': {
        const redactEl = element as RedactElement;
        return (
          <div
            key={element.id}
            className={`editor-element ${isSelected ? 'ring-2 ring-primary' : ''}`}
            style={{
              ...baseStyle,
              backgroundColor: redactEl.fillColor,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          >
            {isSelected && !element.locked && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize"
                onMouseDown={(e) => handleResizeStart(e, element.id)}
              />
            )}
          </div>
        );
      }
      
      default:
        return null;
    }
  }, [activeTool, editingText, handleElementMouseDown, handleResizeStart, handleTextBlur, handleTextChange, handleTextDoubleClick, selectedElement]);

  // Render temp redact while drawing
  const renderTempRedact = () => {
    if (!tempRedact) return null;
    
    return (
      <div
        className="absolute pointer-events-none border-2 border-dashed border-red-500"
        style={{
          left: tempRedact.x,
          top: tempRedact.y,
          width: tempRedact.width,
          height: tempRedact.height,
          backgroundColor: 'rgba(255,255,255,0.8)',
        }}
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-red-500 font-medium whitespace-nowrap">
          Redact Area
        </span>
      </div>
    );
  };

  // Render temp shape while drawing
  const renderTempShape = () => {
    if (!tempShape) return null;
    
    return (
      <div
        className="absolute pointer-events-none border-2 border-dashed border-primary"
        style={{
          left: tempShape.x,
          top: tempShape.y,
          width: tempShape.width,
          height: tempShape.height,
        }}
      />
    );
  };

  // Render current drawing path
  const renderCurrentDrawing = () => {
    if (currentDrawing.length < 2) return null;
    
    const isBrush = activeTool === 'brush';
    
    const pathData = currentDrawing.reduce((acc, point, i) => {
      return acc + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '');
    
    return (
      <svg className="absolute inset-0 pointer-events-none overflow-visible">
        <path
          d={pathData}
          stroke={isBrush ? brushSettings.color : (activeTool === 'highlight' ? '#FFFF00' : activeTool === 'underline' ? '#FF0000' : '#000000')}
          strokeWidth={isBrush ? brushSettings.size : (activeTool === 'highlight' ? 20 : activeTool === 'underline' ? 3 : 2)}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isBrush ? brushSettings.opacity : (activeTool === 'highlight' ? 0.4 : 1)}
        />
      </svg>
    );
  };

  // Render eraser cursor
  const renderEraserCursor = () => {
    if (activeTool !== 'eraser') return null;
    
    return (
      <div
        className="pointer-events-none fixed border-2 border-red-500 rounded-full bg-red-500/10"
        style={{
          width: eraserSettings.size,
          height: eraserSettings.size,
          transform: 'translate(-50%, -50%)',
        }}
        id="eraser-cursor"
      />
    );
  };

  if (!currentPageData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">No page selected</p>
      </div>
    );
  }

  const getCursor = () => {
    if (activeTool === 'pan') return isPanning ? 'grabbing' : 'grab';
    if (activeTool === 'text') return 'text';
    if (['rectangle', 'circle', 'line', 'arrow'].includes(activeTool)) return 'crosshair';
    if (['pen', 'highlight', 'underline', 'brush'].includes(activeTool)) return 'crosshair';
    if (activeTool === 'eraser') return 'none';
    return 'default';
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-auto bg-muted/30 p-4"
    >
      {/* 
        CRITICAL FIX: Use CSS transform: scale(zoom) with transformOrigin: top left.
        This scales the entire page container uniformly. The inner content uses 
        UNSCALED coordinates matching the PDF render space.
        No double-scaling — elements layer does NOT have its own scale transform.
      */}
      <div
        ref={containerRef}
        className="relative mx-auto bg-white shadow-lg select-none"
        style={{
          width: currentPageData.width,
          height: currentPageData.height,
          transform: `scale(${zoom}) rotate(${currentPageData.rotation}deg)`,
          transformOrigin: 'top left',
          cursor: getCursor(),
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* PDF Page Image */}
        {currentPageData.canvas && (
          <img
            src={currentPageData.canvas.toDataURL()}
            alt={`Page ${currentPage + 1}`}
            className="w-full h-full pointer-events-none"
            draggable={false}
          />
        )}
        
        {/* Elements Layer - NO additional scale transform */}
        <div className="absolute inset-0">
          {pageElements.map(renderElement)}
          {renderTempShape()}
          {renderTempRedact()}
          {renderCurrentDrawing()}
        </div>
        
        {/* Text selection overlay - rendered inside scaled container */}
        {textOverlay}
      </div>
      {renderEraserCursor()}
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';
