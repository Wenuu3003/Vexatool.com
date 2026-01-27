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
 * Converts the editor's top-left positioning (CSS-like) into a pdf-lib baseline
 * position using real font metrics.
 */
export function getAlignedPdfTextPlacement({
  pageHeight,
  scaleFactor,
  x,
  y,
  height,
  fontSize,
  font,
}: AlignedTextPlacementInput): AlignedTextPlacement {
  // Convert editor font size to PDF units
  let size = Math.max(0.1, fontSize * scaleFactor);

  // The editor stores a box height; use it to center text vertically.
  const boxHeight = Math.max(0, (height ?? fontSize) * scaleFactor);

  const measure = (s: number) => {
    // "ascent" is height above baseline. "full" includes descender.
    const ascent = font.heightAtSize(s, { descender: false } as HeightAtSizeOptions);
    const full = font.heightAtSize(s, { descender: true } as HeightAtSizeOptions);
    return { ascent, full };
  };

  let { ascent, full } = measure(size);

  // If the element box is smaller than the font metrics, shrink to fit.
  if (boxHeight > 0 && full > boxHeight * 1.05) {
    size = size * (boxHeight / full);
    ({ ascent, full } = measure(size));
  }

  // Top edge of the editor box in PDF coordinates.
  const topY = pageHeight - (y * scaleFactor);

  // Extra vertical room inside the element box (in PDF units). We center within it.
  const extra = Math.max(0, boxHeight - full);

  // pdf-lib drawText uses baseline Y.
  const baselineY = topY - (extra / 2) - ascent;

  return {
    x: x * scaleFactor,
    y: baselineY,
    size,
  };
}
