import { useRef, useState, useCallback, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignatureCanvasProps {
  onSignatureChange: (dataUrl: string | null) => void;
}

const SignatureCanvas = ({ onSignatureChange }: SignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const hasDrawnRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoords = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const exportTrimmedSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = imageData[(y * width + x) * 4 + 3];
        if (alpha === 0) continue;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (maxX < 0 || maxY < 0) {
      return null;
    }

    const padding = 12;
    const trimmedWidth = maxX - minX + 1;
    const trimmedHeight = maxY - minY + 1;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = trimmedWidth + padding * 2;
    exportCanvas.height = trimmedHeight + padding * 2;

    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return null;

    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(
      canvas,
      minX,
      minY,
      trimmedWidth,
      trimmedHeight,
      padding,
      padding,
      trimmedWidth,
      trimmedHeight
    );

    return exportCanvas.toDataURL("image/png");
  }, []);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsDrawing(true);
    hasDrawnRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoords(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoords(event);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "hsl(221 39% 18%)";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = (event?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (event) event.preventDefault();
    if (!isDrawing) return;

    setIsDrawing(false);

    if (hasDrawnRef.current) {
      onSignatureChange(exportTrimmedSignature());
    }
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
    onSignatureChange(null);
  }, [onSignatureChange]);

  return (
    <div className="bg-card p-4 rounded-lg border border-border space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Draw your signature below</p>
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={180}
        className="w-full border border-border rounded cursor-crosshair touch-none"
        style={{ backgroundColor: "white" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />
    </div>
  );
};

export default SignatureCanvas;
