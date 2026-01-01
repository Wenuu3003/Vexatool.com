import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Eraser,
  Paintbrush,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tool = "erase" | "restore" | "pan";

interface MaskEditorProps {
  originalImage: HTMLImageElement;
  maskData: Float32Array;
  width: number;
  height: number;
  onMaskUpdate: (maskData: Float32Array) => void;
  onApply: () => void;
  onCancel: () => void;
}

interface HistoryState {
  maskData: Float32Array;
}

export const MaskEditor = ({
  originalImage,
  maskData,
  width,
  height,
  onMaskUpdate,
  onApply,
  onCancel,
}: MaskEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [activeTool, setActiveTool] = useState<Tool>("erase");
  const [brushSize, setBrushSize] = useState(30);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([{ maskData: new Float32Array(maskData) }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentMask = useRef<Float32Array>(new Float32Array(maskData));

  // Initialize canvases
  useEffect(() => {
    if (!canvasRef.current || !maskCanvasRef.current || !overlayCanvasRef.current) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    canvas.width = width;
    canvas.height = height;
    maskCanvas.width = width;
    maskCanvas.height = height;
    overlayCanvas.width = width;
    overlayCanvas.height = height;

    // Draw original image
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(originalImage, 0, 0, width, height);
    }

    // Initialize mask
    currentMask.current = new Float32Array(maskData);
    renderMask();
  }, [originalImage, maskData, width, height]);

  // Render the mask overlay
  const renderMask = useCallback(() => {
    if (!maskCanvasRef.current || !canvasRef.current) return;

    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas.getContext("2d");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!maskCtx || !ctx) return;

    // Get original image data
    ctx.drawImage(originalImage, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    // Create mask visualization
    const maskImageData = maskCtx.createImageData(width, height);

    for (let i = 0; i < currentMask.current.length; i++) {
      // RMBG format: mask value 1 = foreground (show), 0 = background (hide)
      const maskValue = currentMask.current[i];
      const alpha = Math.round(maskValue * 255);

      // Show original image with transparency based on mask
      maskImageData.data[i * 4] = imageData.data[i * 4];
      maskImageData.data[i * 4 + 1] = imageData.data[i * 4 + 1];
      maskImageData.data[i * 4 + 2] = imageData.data[i * 4 + 2];
      maskImageData.data[i * 4 + 3] = alpha;
    }

    maskCtx.putImageData(maskImageData, 0, 0);
  }, [originalImage, width, height]);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const newMask = new Float32Array(currentMask.current);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ maskData: newMask });

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }

    setHistory(newHistory);
    onMaskUpdate(newMask);
  }, [history, historyIndex, onMaskUpdate]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      currentMask.current = new Float32Array(history[newIndex].maskData);
      renderMask();
      onMaskUpdate(currentMask.current);
    }
  }, [historyIndex, history, renderMask, onMaskUpdate]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      currentMask.current = new Float32Array(history[newIndex].maskData);
      renderMask();
      onMaskUpdate(currentMask.current);
    }
  }, [historyIndex, history, renderMask, onMaskUpdate]);

  // Reset mask
  const handleReset = useCallback(() => {
    currentMask.current = new Float32Array(maskData);
    renderMask();
    saveToHistory();
  }, [maskData, renderMask, saveToHistory]);

  // Get canvas coordinates from mouse event
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!overlayCanvasRef.current) return null;

      const rect = overlayCanvasRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const x = (clientX - rect.left - pan.x) / zoom;
      const y = (clientY - rect.top - pan.y) / zoom;

      return { x, y };
    },
    [pan, zoom]
  );

  // Draw brush stroke on mask
  const drawBrush = useCallback(
    (x: number, y: number, prevX?: number, prevY?: number) => {
      const radius = brushSize / 2;
      // RMBG format: 1 = foreground (keep), 0 = background (remove)
      // Erase tool removes from foreground (sets to 0), Restore adds to foreground (sets to 1)
      const value = activeTool === "erase" ? 0 : 1;

      // If we have a previous point, interpolate
      if (prevX !== undefined && prevY !== undefined) {
        const distance = Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);
        const steps = Math.max(1, Math.floor(distance / 2));

        for (let step = 0; step <= steps; step++) {
          const t = step / steps;
          const interpX = prevX + (x - prevX) * t;
          const interpY = prevY + (y - prevY) * t;
          applyBrushAt(interpX, interpY, radius, value);
        }
      } else {
        applyBrushAt(x, y, radius, value);
      }

      renderMask();
    },
    [activeTool, brushSize, renderMask]
  );

  // Apply brush at a specific point
  const applyBrushAt = (cx: number, cy: number, radius: number, value: number) => {
    const startX = Math.max(0, Math.floor(cx - radius));
    const endX = Math.min(width - 1, Math.ceil(cx + radius));
    const startY = Math.max(0, Math.floor(cy - radius));
    const endY = Math.min(height - 1, Math.ceil(cy + radius));

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist <= radius) {
          const idx = y * width + x;
          // Soft brush edge
          const strength = 1 - (dist / radius) * 0.3;
          // RMBG format: value 1 = restore (add to foreground), value 0 = erase (remove from foreground)
          if (value === 1) {
            currentMask.current[idx] = Math.min(1, currentMask.current[idx] + strength * 0.5);
          } else {
            currentMask.current[idx] = Math.max(0, currentMask.current[idx] - strength * 0.5);
          }
        }
      }
    }
  };

  // Draw brush cursor
  const drawCursor = useCallback(
    (x: number, y: number) => {
      if (!overlayCanvasRef.current) return;

      const ctx = overlayCanvasRef.current.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // Draw brush circle
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = activeTool === "erase" ? "#ef4444" : "#22c55e";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = activeTool === "erase" ? "#ef4444" : "#22c55e";
      ctx.fill();
    },
    [brushSize, activeTool, width, height]
  );

  // Mouse/touch handlers
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (activeTool === "pan") {
      setIsPanning(true);
      setLastPoint(coords);
    } else {
      setIsDrawing(true);
      setLastPoint(coords);
      drawBrush(coords.x, coords.y);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (activeTool !== "pan") {
      drawCursor(coords.x, coords.y);
    }

    if (isPanning && lastPoint) {
      const deltaX = (coords.x - lastPoint.x) * zoom;
      const deltaY = (coords.y - lastPoint.y) * zoom;
      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    } else if (isDrawing && lastPoint) {
      drawBrush(coords.x, coords.y, lastPoint.x, lastPoint.y);
      setLastPoint(coords);
    }
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      saveToHistory();
    }
    setIsDrawing(false);
    setIsPanning(false);
    setLastPoint(null);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(4, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.25, z - 0.25));

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        e.preventDefault();
      } else if (e.key === "[") {
        setBrushSize((s) => Math.max(5, s - 5));
      } else if (e.key === "]") {
        setBrushSize((s) => Math.min(200, s + 5));
      } else if (e.key === "e") {
        setActiveTool("erase");
      } else if (e.key === "r") {
        setActiveTool("restore");
      } else if (e.key === " ") {
        setActiveTool("pan");
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setActiveTool("erase");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleUndo, handleRedo]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-xl">
        {/* Tool buttons */}
        <div className="flex gap-2">
          <Button
            variant={activeTool === "erase" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("erase")}
            className="gap-2"
          >
            <Eraser className="w-4 h-4" />
            Erase (E)
          </Button>
          <Button
            variant={activeTool === "restore" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("restore")}
            className="gap-2"
          >
            <Paintbrush className="w-4 h-4" />
            Restore (R)
          </Button>
          <Button
            variant={activeTool === "pan" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("pan")}
            className="gap-2"
          >
            <Move className="w-4 h-4" />
            Pan (Space)
          </Button>
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Label className="text-sm whitespace-nowrap">Brush: {brushSize}px</Label>
          <Slider
            value={[brushSize]}
            onValueChange={([v]) => setBrushSize(v)}
            min={5}
            max={200}
            step={1}
            className="flex-1"
          />
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Badge variant="secondary" className="min-w-[60px] justify-center">
            {Math.round(zoom * 100)}%
          </Badge>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset} title="Reset mask">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]"
        style={{ height: "500px" }}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          {/* Base canvas (original image) */}
          <canvas ref={canvasRef} className="absolute top-0 left-0" />

          {/* Mask canvas (shows result) */}
          <canvas ref={maskCanvasRef} className="absolute top-0 left-0" />

          {/* Overlay canvas (brush cursor) */}
          <canvas
            ref={overlayCanvasRef}
            className={cn(
              "absolute top-0 left-0",
              activeTool === "pan" ? "cursor-grab" : "cursor-crosshair"
            )}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button onClick={onApply} className="flex-1">
          Apply Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Tips */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          <strong>Tips:</strong> Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">[</kbd> and{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">]</kbd> to adjust brush size.
        </p>
        <p>
          Hold <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> to pan.{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd> to undo.
        </p>
      </div>
    </div>
  );
};
