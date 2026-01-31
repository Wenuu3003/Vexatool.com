import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ToolData } from "@/data/toolsData";

interface ToolPreviewCardProps {
  tool: ToolData;
  index?: number;
  showPreview?: boolean;
}

export const ToolPreviewCard = ({ tool, index = 0, showPreview = true }: ToolPreviewCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = tool.icon;

  // Intersection Observer for lazy loading and animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Stagger delay for animation
  const staggerDelay = Math.min(index % 4, 3) * 0.08;

  // Placeholder image with tool icon
  const PlaceholderImage = () => (
    <div className={cn(
      "w-full h-full flex flex-col items-center justify-center",
      tool.colorClass,
      "bg-opacity-10"
    )}>
      <div className={cn(
        "w-16 h-16 rounded-xl flex items-center justify-center mb-3",
        tool.colorClass
      )}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">Preview</span>
    </div>
  );

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative bg-card rounded-2xl border border-border overflow-hidden",
        "shadow-tool-card hover:shadow-tool-card-hover",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
      style={{
        transitionDelay: isVisible ? `${staggerDelay}s` : "0s",
      }}
      itemScope
      itemType="https://schema.org/SoftwareApplication"
    >
      {/* Preview Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {showPreview && !showIframe && (
          <>
            {/* Static Preview Image with Lazy Loading */}
            {tool.previewImage ? (
              <img
                src={isVisible ? tool.previewImage : undefined}
                alt={`${tool.title} - Online tool preview screenshot`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
                itemProp="image"
              />
            ) : null}
            
            {/* Fallback placeholder if no image or not loaded */}
            {(!tool.previewImage || !imageLoaded) && (
              <PlaceholderImage />
            )}

            {/* Hover Overlay with Live Preview Button */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "flex items-end justify-center pb-4"
            )}>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 bg-white/90 hover:bg-white text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  setShowIframe(true);
                }}
              >
                <Play className="w-4 h-4" />
                Live Preview
              </Button>
            </div>
          </>
        )}

        {/* Live Iframe Preview */}
        {showIframe && (
          <div className="relative w-full h-full">
            <iframe
              src={tool.href}
              title={`${tool.title} live preview`}
              className="w-full h-full border-0"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
            <button
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
              onClick={() => setShowIframe(false)}
              aria-label="Close preview"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Category Badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium"
        >
          {tool.category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Icon and Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            "transition-transform duration-300 group-hover:scale-105",
            tool.colorClass
          )}>
            <Icon className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              className="text-base font-semibold text-foreground leading-tight mb-1 line-clamp-1"
              itemProp="name"
            >
              {tool.title}
            </h3>
            <p 
              className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
              itemProp="description"
            >
              {tool.shortDescription}
            </p>
          </div>
        </div>

        {/* Features Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tool.features.slice(0, 3).map((feature, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs bg-muted rounded-md text-muted-foreground"
            >
              {feature}
            </span>
          ))}
          {tool.features.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-muted rounded-md text-muted-foreground">
              +{tool.features.length - 3} more
            </span>
          )}
        </div>

        {/* Action Button */}
        <Link
          to={tool.href}
          className={cn(
            "inline-flex items-center justify-center w-full gap-2",
            "px-4 py-2.5 rounded-xl font-medium text-sm",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          itemProp="url"
        >
          <ExternalLink className="w-4 h-4" />
          Open Tool
        </Link>
      </div>

      {/* Schema.org hidden metadata */}
      <meta itemProp="applicationCategory" content="Utility" />
      <meta itemProp="operatingSystem" content="Web Browser" />
      <meta itemProp="offers" itemScope itemType="https://schema.org/Offer" />
    </article>
  );
};
