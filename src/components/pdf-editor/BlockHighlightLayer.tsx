import { memo, useCallback, useState } from 'react';
import { TextRegion } from './useTextBlocks';

interface BlockHighlightLayerProps {
  regions: TextRegion[];
  selectedRegion: string | null;
  enabled: boolean;
  onSelectRegion: (id: string | null) => void;
}

/**
 * Canvas overlay that highlights text block regions with improved visual precision.
 * Each region gets a tight bounding box matching the detected text area.
 */
export const BlockHighlightLayer = memo(({
  regions,
  selectedRegion,
  enabled,
  onSelectRegion,
}: BlockHighlightLayerProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleClick = useCallback((e: React.MouseEvent, regionId: string) => {
    e.stopPropagation();
    if (!enabled) return;
    onSelectRegion(selectedRegion === regionId ? null : regionId);
  }, [enabled, selectedRegion, onSelectRegion]);

  if (!enabled || regions.length === 0) return null;

  const PAD = 1;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {regions.map((region) => {
        const isSelected = selectedRegion === region.id;
        const isHovered = hoveredRegion === region.id;
        const isWord = region.kind === 'word';

        return (
          <div
            key={region.id}
            className="absolute pointer-events-auto transition-colors duration-100"
            style={{
              left: region.x - PAD,
              top: region.y - PAD,
              width: region.width + PAD * 2,
              height: region.height + PAD * 2,
              borderRadius: isWord ? 2 : 3,
              cursor: 'pointer',
              minHeight: 12,
              minWidth: 12,
              // Precise styling based on selection state
              backgroundColor: isSelected
                ? 'hsla(var(--primary) / 0.18)'
                : isHovered
                  ? 'hsla(var(--primary) / 0.1)'
                  : 'transparent',
              outline: isSelected
                ? '2px solid hsla(var(--primary) / 0.8)'
                : isHovered
                  ? '1.5px solid hsla(var(--primary) / 0.4)'
                  : '1px solid hsla(var(--primary) / 0.15)',
              outlineOffset: 0,
              boxShadow: isSelected ? '0 0 0 1px hsla(var(--primary) / 0.15)' : 'none',
            }}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion((prev) => (prev === region.id ? null : prev))}
            onClick={(e) => handleClick(e, region.id)}
            title={`${region.kind}: ${region.text.slice(0, 60)}${region.text.length > 60 ? '…' : ''}`}
          >
            {isSelected && (
              <div
                className="absolute bg-primary text-primary-foreground font-medium whitespace-nowrap capitalize"
                style={{
                  top: -18,
                  left: 0,
                  fontSize: 9,
                  lineHeight: '14px',
                  padding: '1px 5px',
                  borderRadius: '3px 3px 0 0',
                  pointerEvents: 'none',
                }}
              >
                {region.kind}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

BlockHighlightLayer.displayName = 'BlockHighlightLayer';
