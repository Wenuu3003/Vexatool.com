import { memo, useCallback, useState } from 'react';
import { TextRegion } from './useTextBlocks';

interface BlockHighlightLayerProps {
  regions: TextRegion[];
  selectedRegion: string | null;
  enabled: boolean;
  onSelectRegion: (id: string | null) => void;
}

/**
 * Canvas overlay that highlights text block regions.
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

  const PAD = 2;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {regions.map((region) => {
        const isSelected = selectedRegion === region.id;
        const isHovered = hoveredRegion === region.id;

        return (
          <div
            key={region.id}
            className={`absolute pointer-events-auto transition-all duration-150 ${
              isSelected
                ? 'bg-primary/15 ring-2 ring-primary/80 shadow-sm'
                : isHovered
                  ? 'bg-primary/10 ring-2 ring-primary/40'
                  : 'bg-transparent ring-1 ring-primary/20'
            }`}
            style={{
              left: region.x - PAD,
              top: region.y - PAD,
              width: region.width + PAD * 2,
              height: region.height + PAD * 2,
              borderRadius: 3,
              cursor: 'pointer',
              minHeight: 20,
              minWidth: 20,
            }}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion((prev) => (prev === region.id ? null : prev))}
            onClick={(e) => handleClick(e, region.id)}
            title={`${region.kind} · ${region.text.slice(0, 50)}${region.text.length > 50 ? '…' : ''}`}
          >
            {(isSelected || isHovered) && (
              <div className="absolute -top-5 left-0 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-t font-medium whitespace-nowrap capitalize">
                {isSelected ? 'Selected' : 'Block'} · {region.kind}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

BlockHighlightLayer.displayName = 'BlockHighlightLayer';
