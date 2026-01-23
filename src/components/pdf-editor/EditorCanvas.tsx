import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { 
  AnyElement, 
  TextElement, 
  ShapeElement, 
  ImageElement, 
  DrawingElement,
  WatermarkElement,
  PageInfo, 
  Tool,
  Point 
} from './types';

interface EditorCanvasProps {
  pages: PageInfo[];
  currentPage: number;
  elements: AnyElement[];
  selectedElement: string | null;
  activeTool: Tool;
  zoom: number;
  onSelectElement: (id: string | null) => void;
  onAddElement: (element: AnyElement) => void;
  onUpdateElement: (id: string, updates: Partial<AnyElement>) => void;
  onElementsChange: (elements: AnyElement[]) => void;
}

export const EditorCanvas = memo(({
  pages,
  currentPage,
  elements,
  selectedElement,
  activeTool,
  zoom,
  onSelectElement,
  onAddElement,
  onUpdateElement,
  onElementsChange,
}: EditorCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState<Point>({ x: 0, y: 0 });
  const [currentDrawing, setCurrentDrawing] = useState<Point[]>([]);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [tempShape, setTempShape] = useState<ShapeElement | null>(null);
  
  const currentPageData = pages[currentPage];
  const pageElements = elements.filter(el => el.page === currentPage || (el.type === 'watermark' && (el as WatermarkElement).applyTo === 'all'));
  
  const getMousePosition = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    };
  }, [zoom]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getMousePosition(e);
    
    // Check if clicking on an element
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
    } else if (['pen', 'highlight', 'underline'].includes(activeTool)) {
      setIsDrawing(true);
      setCurrentDrawing([pos]);
    }
  }, [activeTool, currentPage, elements.length, getMousePosition, onAddElement, onSelectElement]);

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
    
    if (isDrawing) {
      setCurrentDrawing(prev => [...prev, pos]);
    }
  }, [getMousePosition, isDrawing, shapeStart, tempShape]);

  const handleCanvasMouseUp = useCallback(() => {
    if (tempShape && shapeStart) {
      if (tempShape.width > 5 || tempShape.height > 5) {
        onAddElement(tempShape);
        onSelectElement(tempShape.id);
      }
      setTempShape(null);
      setShapeStart(null);
    }
    
    if (isDrawing && currentDrawing.length > 1) {
      const bounds = currentDrawing.reduce(
        (acc, p) => ({
          minX: Math.min(acc.minX, p.x),
          minY: Math.min(acc.minY, p.y),
          maxX: Math.max(acc.maxX, p.x),
          maxY: Math.max(acc.maxY, p.y),
        }),
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );
      
      const drawing: DrawingElement = {
        id: `drawing-${Date.now()}`,
        type: 'drawing',
        page: currentPage,
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        rotation: 0,
        opacity: activeTool === 'highlight' ? 0.4 : 1,
        locked: false,
        zIndex: elements.length,
        points: currentDrawing.map(p => ({ x: p.x - bounds.minX, y: p.y - bounds.minY })),
        strokeColor: activeTool === 'highlight' ? '#FFFF00' : activeTool === 'underline' ? '#FF0000' : '#000000',
        strokeWidth: activeTool === 'highlight' ? 20 : activeTool === 'underline' ? 3 : 2,
        drawingType: activeTool as 'pen' | 'highlight' | 'underline',
      };
      onAddElement(drawing);
    }
    
    setIsDrawing(false);
    setCurrentDrawing([]);
  }, [activeTool, currentDrawing, currentPage, elements.length, isDrawing, onAddElement, onSelectElement, shapeStart, tempShape]);

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
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', () => setIsResizing(false));
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', () => setIsResizing(false));
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
      
      default:
        return null;
    }
  }, [activeTool, editingText, handleElementMouseDown, handleResizeStart, handleTextBlur, handleTextChange, handleTextDoubleClick, selectedElement]);

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
    
    const pathData = currentDrawing.reduce((acc, point, i) => {
      return acc + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '');
    
    return (
      <svg className="absolute inset-0 pointer-events-none overflow-visible">
        <path
          d={pathData}
          stroke={activeTool === 'highlight' ? '#FFFF00' : activeTool === 'underline' ? '#FF0000' : '#000000'}
          strokeWidth={activeTool === 'highlight' ? 20 : activeTool === 'underline' ? 3 : 2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={activeTool === 'highlight' ? 0.4 : 1}
        />
      </svg>
    );
  };

  if (!currentPageData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">No page selected</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-muted/30 p-4">
      <div
        ref={containerRef}
        className="relative mx-auto bg-white shadow-lg"
        style={{
          width: currentPageData.width * zoom,
          height: currentPageData.height * zoom,
          transform: `rotate(${currentPageData.rotation}deg)`,
          cursor: activeTool === 'pan' ? 'grab' : 
                  activeTool === 'text' ? 'text' :
                  ['rectangle', 'circle', 'line', 'arrow'].includes(activeTool) ? 'crosshair' :
                  ['pen', 'highlight', 'underline'].includes(activeTool) ? 'crosshair' :
                  'default',
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
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
        
        {/* Elements Layer */}
        <div 
          className="absolute inset-0" 
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          {pageElements.map(renderElement)}
          {renderTempShape()}
          {renderCurrentDrawing()}
        </div>
      </div>
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';
