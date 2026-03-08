type HeightAtSizeOptions = { descender?: boolean };

type FontLike = {
  heightAtSize: (size: number, options?: HeightAtSizeOptions) => number;
};

export interface AlignedTextPlacementInput {
  pageHeight: number;
  scaleFactor: number;
  x: number;
  y: number; // top-left Y in editor coordinates
  width?: number;
  height?: number;
  fontSize: number;
  font: FontLike;
}

export interface AlignedTextPlacement {
  x: number;
  y: number; // pdf-lib baseline Y
  size: number;
}

/**
 * Converts the editor's top-left positioning (CSS-like, lineHeight:1) into a
 * pdf-lib baseline position using real font metrics.
 *
 * Because the editor now uses `lineHeight: 1` with `height: auto`, the
 * rendered CSS box height equals exactly the font's em-square (≈ fontSize).
 * The visible text top sits at element.y and the ascent fills almost all of
 * that height. We therefore simply place the PDF baseline at:
 *
 *   baselineY = pageTop - ascent
 *
 * No centering / boxHeight logic is needed — the editor and PDF now agree.
 */
export function getAlignedPdfTextPlacement({
  pageHeight,
  scaleFactor,
  x,
  y,
  fontSize,
  font,
}: AlignedTextPlacementInput): AlignedTextPlacement {
  // Convert editor font size to PDF units
  const size = Math.max(0.1, fontSize * scaleFactor);

  // Ascent = height from baseline to top of tallest glyph
  const ascent = font.heightAtSize(size, { descender: false } as HeightAtSizeOptions);

  // Top edge of the editor element in PDF coordinate space (PDF Y goes up)
  const topY = pageHeight - (y * scaleFactor);

  // Baseline sits one ascent below the top of the text box
  const baselineY = topY - ascent;

  return {
    x: x * scaleFactor,
    y: baselineY,
    size,
  };
}
