import { useRef, useEffect, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { SignatureObject, PageDimensions } from "./types";
import { SIGNATURE_FONTS } from "./types";
import { Lock, Unlock, X, Move } from "lucide-react";

interface PDFPageViewProps {
  pdf: pdfjsLib.PDFDocumentProxy;
  pageNumber: number; // 1-based
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
  const [rendered, setRendered] = useState(false);
  const renderTaskRef = useRef<any>(null);
  const [pageDims, setPageDims] = useState<PageDimensions>({ width: 0, height: 0 });

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; sigX: number; sigY: number } | null>(null);

  // Render PDF page once
  useEffect(() => {
    let cancelled = false;

    const renderPage = async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 }); // Render at 1.5x for quality
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Cancel previous render
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const dims = { width: viewport.width, height: viewport.height };
      setPageDims(dims);
      onPageDimensions(pageNumber - 1, dims);

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
        if (!cancelled) setRendered(true);
      } catch (err: any) {
        if (err?.name !== "RenderingCancelled") console.error(err);
      }
    };

    renderPage();
    return () => { cancelled = true; };
  }, [pdf, pageNumber]); // Only re-render when pdf or page changes, NOT on zoom

  const handleContainerClick = (e: React.MouseEvent) => {
    if (draggingId) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;
    onPageClick(pageNumber - 1, xRatio, yRatio);
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, sig: SignatureObject) => {
    if (sig.locked) return;
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDraggingId(sig.id);
    dragStartRef.current = { startX: clientX, startY: clientY, sigX: sig.x, sigY: sig.y };
  };

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingId || !dragStartRef.current || !containerRef.current) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (clientX - dragStartRef.current.startX) / rect.width;
    const dy = (clientY - dragStartRef.current.startY) / rect.height;
    const newX = Math.max(0, Math.min(1, dragStartRef.current.sigX + dx));
    const newY = Math.max(0, Math.min(1, dragStartRef.current.sigY + dy));
    onSignatureMoved(draggingId, newX, newY);
  }, [draggingId, onSignatureMoved]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    dragStartRef.current = null;
  }, []);

  const pageSignatures = signatures.filter(s => s.pageIndex === pageNumber - 1);

  return (
    <div className="relative mb-4">
      <p className="text-xs text-muted-foreground text-center mb-1">Page {pageNumber}</p>
      <div
        ref={containerRef}
        className="relative mx-auto shadow-lg bg-white cursor-crosshair select-none"
        style={{
          width: pageDims.width * zoom,
          height: pageDims.height * zoom,
          overflow: 'hidden',
        }}
        onClick={handleContainerClick}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
      >
        {/* PDF Canvas - rendered once, scaled via CSS transform */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'top left',
            transform: `scale(${zoom})`,
            pointerEvents: 'none',
          }}
        />

        {/* Signature overlays */}
        {pageSignatures.map((sig) => (
          <div
            key={sig.id}
            className="absolute group"
            style={{
              left: `${sig.x * 100}%`,
              top: `${sig.y * 100}%`,
              width: `${sig.width * 100}%`,
              height: `${sig.height * 100}%`,
              border: sig.locked ? '1px solid transparent' : '2px dashed hsl(var(--primary))',
              cursor: sig.locked ? 'default' : 'move',
              zIndex: 10,
            }}
            onMouseDown={(e) => handleDragStart(e, sig)}
            onTouchStart={(e) => handleDragStart(e, sig)}
          >
            {sig.type === 'draw' && sig.dataUrl && (
              <img
                src={sig.dataUrl}
                alt="Signature"
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            )}
            {sig.type === 'type' && sig.text && (
              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                <span
                    className={sig.fontStyle ? SIGNATURE_FONTS[sig.fontStyle].className : 'italic'}
                    style={{
                      fontSize: `${Math.max(12, sig.height * pageDims.height * zoom * 0.5)}px`,
                      color: 'rgb(0, 0, 128)',
                      fontFamily: sig.fontStyle ? SIGNATURE_FONTS[sig.fontStyle].fontFamily : "'Times New Roman', serif",
                      whiteSpace: 'nowrap',
                    }}
                >
                  {sig.text}
                </span>
              </div>
            )}

            {/* Controls */}
            {!sig.locked && (
              <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onSignatureToggleLock(sig.id); }}
                  className="p-1 rounded bg-card border border-border shadow-sm hover:bg-muted"
                  title="Lock signature"
                >
                  <Unlock className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSignatureRemoved(sig.id); }}
                  className="p-1 rounded bg-card border border-border shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                  title="Remove signature"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {sig.locked && (
              <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onSignatureToggleLock(sig.id); }}
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
