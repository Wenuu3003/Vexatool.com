import { useRef, useEffect, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { SignatureObject, PageDimensions } from "./types";
import { SIGNATURE_FONTS } from "./types";
import { Lock, Unlock, X } from "lucide-react";

interface PDFPageViewProps {
  pdf: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  signatures: SignatureObject[];
  onSignatureMoved: (id: string, x: number, y: number) => void;
  onSignatureRemoved: (id: string) => void;
  onSignatureToggleLock: (id: string) => void;
  onPageClick: (pageIndex: number, xRatio: number, yRatio: number) => void;
  onPageDimensions: (pageIndex: number, dims: PageDimensions) => void;
}

const PDFPageView = ({
  pdf,
  pageNumber,
  zoom,
  signatures,
  onSignatureMoved,
  onSignatureRemoved,
  onSignatureToggleLock,
  onPageClick,
  onPageDimensions,
}: PDFPageViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [pageDims, setPageDims] = useState<PageDimensions>({ width: 0, height: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    sigX: number;
    sigY: number;
    sigWidth: number;
    sigHeight: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const renderPage = async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore stale render cancellations.
        }
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dims = { width: viewport.width, height: viewport.height };
      setPageDims(dims);
      onPageDimensions(pageNumber - 1, dims);

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch (error: any) {
        if (error?.name !== "RenderingCancelled") {
          console.error("Sign PDF page render error:", error);
        }
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore stale render cancellations.
        }
      }
    };
  }, [onPageDimensions, pageNumber, pdf]);

  const handleContainerClick = (event: React.MouseEvent) => {
    if (draggingId) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;
    onPageClick(pageNumber - 1, xRatio, yRatio);
  };

  const handleDragStart = (event: React.MouseEvent | React.TouchEvent, signature: SignatureObject) => {
    if (signature.locked) return;

    event.stopPropagation();
    event.preventDefault();

    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;

    setDraggingId(signature.id);
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      sigX: signature.x,
      sigY: signature.y,
      sigWidth: signature.width,
      sigHeight: signature.height,
    };
  };

  const handleDragMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!draggingId || !dragStartRef.current || !containerRef.current) return;

    event.preventDefault();

    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (clientX - dragStartRef.current.startX) / rect.width;
    const dy = (clientY - dragStartRef.current.startY) / rect.height;

    const nextX = Math.max(0, Math.min(1 - dragStartRef.current.sigWidth, dragStartRef.current.sigX + dx));
    const nextY = Math.max(0, Math.min(1 - dragStartRef.current.sigHeight, dragStartRef.current.sigY + dy));

    onSignatureMoved(draggingId, nextX, nextY);
  }, [draggingId, onSignatureMoved]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    dragStartRef.current = null;
  }, []);

  const pageSignatures = signatures.filter((signature) => signature.pageIndex === pageNumber - 1);

  return (
    <div className="relative mb-4">
      <p className="text-xs text-muted-foreground text-center mb-1">Page {pageNumber}</p>
      <div
        ref={containerRef}
        className="relative mx-auto shadow-lg bg-white cursor-crosshair select-none"
        style={{
          width: pageDims.width * zoom,
          height: pageDims.height * zoom,
          overflow: "hidden",
          touchAction: "none",
        }}
        onClick={handleContainerClick}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "top left",
            transform: `scale(${zoom})`,
            pointerEvents: "none",
          }}
        />

        {pageSignatures.map((signature) => (
          <div
            key={signature.id}
            className="absolute group"
            style={{
              left: `${signature.x * 100}%`,
              top: `${signature.y * 100}%`,
              width: `${signature.width * 100}%`,
              height: `${signature.height * 100}%`,
              border: signature.locked ? "1px solid transparent" : "2px dashed hsl(var(--primary))",
              cursor: signature.locked ? "default" : "move",
              zIndex: 10,
            }}
            onMouseDown={(event) => handleDragStart(event, signature)}
            onTouchStart={(event) => handleDragStart(event, signature)}
          >
            {signature.dataUrl ? (
              <img
                src={signature.dataUrl}
                alt="Signature"
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            ) : signature.type === "type" && signature.text ? (
              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                <span
                  className={signature.fontStyle ? SIGNATURE_FONTS[signature.fontStyle].className : "italic"}
                  style={{
                    fontSize: `${Math.max(12, signature.height * pageDims.height * zoom * 0.5)}px`,
                    color: "hsl(var(--foreground))",
                    fontFamily: signature.fontStyle
                      ? SIGNATURE_FONTS[signature.fontStyle].fontFamily
                      : "'Times New Roman', serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {signature.text}
                </span>
              </div>
            ) : null}

            {!signature.locked && (
              <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onSignatureToggleLock(signature.id);
                  }}
                  className="p-1 rounded bg-card border border-border shadow-sm hover:bg-muted"
                  title="Lock signature"
                >
                  <Unlock className="w-3 h-3" />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onSignatureRemoved(signature.id);
                  }}
                  className="p-1 rounded bg-card border border-border shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                  title="Remove signature"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {signature.locked && (
              <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onSignatureToggleLock(signature.id);
                  }}
                  className="p-1 rounded bg-card border border-border shadow-sm hover:bg-muted"
                  title="Unlock signature"
                >
                  <Lock className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFPageView;
