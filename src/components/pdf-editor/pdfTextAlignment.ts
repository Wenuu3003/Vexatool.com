type HeightAtSizeOptions = { descender?: boolean };

type FontLike = {
  heightAtSize: (size: number, options?: HeightAtSizeOptions) => number;
};

export interface AlignedTextPlacementInput {
  pageHeight: number;
  scaleFactor: number;
  x: number;
  y: number; // top-left Y in editor coordinates (PDF render-space pixels)
  width?: number;
  height?: number;
  fontSize: number;
  font: FontLike;
  lineHeightMultiplier?: number;
}

export interface AlignedTextPlacement {
  x: number;
  y: number; // pdf-lib baseline Y
  size: number;
}

/**
 * Converts the editor's top-left positioning into a pdf-lib baseline position.
 *
 * The editor renders text with lineHeight:1 so the CSS box height equals the
 * font's em-square (~fontSize). The visible text top sits at element.y.
 *
 * pdf-lib uses a bottom-up coordinate system where y=0 is the page bottom.
 * The baseline is where the text "sits" — ascent distance below the top.
 *
 * Key fix: We use the font's actual ascent metric (heightAtSize without
 * descender) to compute the exact baseline position, ensuring the preview
 * and export match pixel-perfectly.
 */
export function getAlignedPdfTextPlacement({
  pageHeight,
  scaleFactor,
  x,
  y,
  fontSize,
  font,
  lineHeightMultiplier = 1,
}: AlignedTextPlacementInput): AlignedTextPlacement {
  // Convert editor font size to PDF units
  const size = Math.max(0.1, fontSize * scaleFactor);

  // Ascent = height from baseline to top of tallest glyph
  const ascent = font.heightAtSize(size, { descender: false } as HeightAtSizeOptions);

  // Top edge of the editor element in PDF coordinate space (PDF Y goes up from bottom)
  const topY = pageHeight - (y * scaleFactor);

  // Baseline sits one ascent below the top of the text box
  const baselineY = topY - ascent;

  return {
    x: x * scaleFactor,
    y: baselineY,
    size,
  };
}
