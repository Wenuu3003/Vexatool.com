import { memo, useCallback } from 'react';
import { TextRegion } from './useTextBlocks';

interface BlockHighlightLayerProps {
  regions: TextRegion[];
  selectedRegion: string | null;
  enabled: boolean;
  onSelectRegion: (id: string | null) => void;
}

/**
 * Canvas overlay that highlights text block regions.
 * Rendered inside the scaled container (no own zoom transform).
 * Shows clear boundaries for each detected text region.
 */
export const BlockHighlightLayer = memo(({
  regions,
  selectedRegion,
  enabled,
  onSelectRegion,
}: BlockHighlightLayerProps) => {
  const handleClick = useCallback((e: React.MouseEvent, regionId: string) => {
    e.stopPropagation();
    if (!enabled) return;
    onSelectRegion(selectedRegion === regionId ? null : regionId);
  }, [enabled, selectedRegion, onSelectRegion]);

  if (!enabled || regions.length === 0) return null;

  const PAD = 4; // padding around block

  return (
    <div className="absolute inset-0 pointer-events-none">
      {regions.map((region) => {
        const isSelected = selectedRegion === region.id;

        return (
          <div
            key={region.id}
            className={`absolute pointer-events-auto transition-all duration-150 ${
              isSelected
                ? 'bg-primary/15 ring-2 ring-primary/70 shadow-sm'
                : 'bg-transparent hover:bg-primary/8 ring-1 ring-primary/20 hover:ring-primary/40'
            }`}
            style={{
              left: region.x - PAD,
              top: region.y - PAD,
              width: region.width + PAD * 2,
              height: region.height + PAD * 2,
              borderRadius: 3,
              cursor: 'pointer',
            }}
            onClick={(e) => handleClick(e, region.id)}
            title={`Block: ${region.text.slice(0, 50)}${region.text.length > 50 ? '…' : ''}`}
          >
            {/* Top-left block indicator */}
            {isSelected && (
              <div className="absolute -top-5 left-0 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-t font-medium whitespace-nowrap">
                Selected Block
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

BlockHighlightLayer.displayName = 'BlockHighlightLayer';
