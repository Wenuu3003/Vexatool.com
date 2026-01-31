import { useState, useRef, useEffect } from "react";
import { ExternalLink, Maximize2, Minimize2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LiveToolPreviewProps {
  toolUrl: string;
  toolTitle: string;
  className?: string;
}

/**
 * LiveToolPreview - Renders a live iframe preview of a tool
 * Used on tool detail pages for interactive preview
 * 
 * Features:
 * - Lazy loading iframe
 * - Fullscreen toggle
 * - Refresh functionality
 * - Loading state
 * - Responsive design
 */
export const LiveToolPreview = ({ toolUrl, toolTitle, className }: LiveToolPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Lazy load iframe when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Refresh iframe
  const refreshPreview = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-card rounded-2xl border border-border overflow-hidden",
        "shadow-lg",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Browser dots */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px] sm:max-w-none">
            {toolTitle} - Live Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPreview}
            className="h-8 w-8 p-0"
            aria-label="Refresh preview"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 gap-2"
          >
            <a href={toolUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Open</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Iframe Container */}
      <div className={cn(
        "relative w-full",
        isFullscreen ? "h-[calc(100vh-56px)]" : "aspect-[16/9] min-h-[400px]"
      )}>
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading preview...</span>
            </div>
          </div>
        )}

        {/* Iframe - Only render when visible */}
        {isVisible && (
          <iframe
            ref={iframeRef}
            src={toolUrl}
            title={`${toolTitle} live preview`}
            className="w-full h-full border-0"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setIsLoading(false)}
          />
        )}

        {/* Placeholder when not visible */}
        {!isVisible && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">Scroll to load preview</span>
          </div>
        )}
      </div>
    </div>
  );
};
