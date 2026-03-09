// PDF Editor Types

export interface Point {
  x: number;
  y: number;
}

export interface EditorElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'drawing' | 'watermark' | 'redact';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  zIndex: number;
}

export interface TextElement extends EditorElement {
  type: 'text';
  text: string;
  fontSize: number;       // in canvas pixels (= PDF points × PDF_RENDER_SCALE)
  fontFamily: string;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  letterSpacing?: number;
  lineHeightMultiplier?: number;
  textAlign?: 'left' | 'center' | 'right';
  backgroundMask?: boolean;
}

export interface ShapeElement extends EditorElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line' | 'arrow';
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  endX?: number;
  endY?: number;
}

export interface ImageElement extends EditorElement {
  type: 'image';
  src: string;
  originalWidth: number;
  originalHeight: number;
}

export interface DrawingElement extends EditorElement {
  type: 'drawing';
  points: Point[];
  strokeColor: string;
  strokeWidth: number;
  drawingType: 'pen' | 'highlight' | 'underline' | 'brush';
}

export interface BrushSettings {
  color: string;
  size: number;
  opacity: number;
}

export interface EraserSettings {
  size: number;
}

export interface WatermarkElement extends EditorElement {
  type: 'watermark';
  watermarkType: 'text' | 'image';
  text?: string;
  imageSrc?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  position: 'center' | 'diagonal' | 'tiled';
  applyTo: 'current' | 'all';
}

export type AnyElement = TextElement | ShapeElement | ImageElement | DrawingElement | WatermarkElement | RedactElement;

export interface HistoryState {
  elements: AnyElement[];
  pages: PageInfo[];
}

export interface PageInfo {
  pageNumber: number;
  rotation: number;
  deleted: boolean;
  canvas?: HTMLCanvasElement;
  /** Cached JPEG data URL – computed once on load to prevent repeated toDataURL() calls */
  dataUrl?: string;
  width: number;
  height: number;
}

export interface ZoomLevel {
  value: number;
  label: string;
}

export const ZOOM_LEVELS: ZoomLevel[] = [
  { value: 0.25, label: '25%' },
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1, label: '100%' },
  { value: 1.25, label: '125%' },
  { value: 1.5, label: '150%' },
  { value: 2, label: '200%' },
];

/** PDF_RENDER_SCALE used when rendering pages to canvas */
export const PDF_RENDER_SCALE = 3.0;

/**
 * Font families with their CSS equivalent and pdf-lib mapping.
 * Only families that map cleanly to pdf-lib standard fonts are included,
 * to prevent visual divergence between preview and exported PDF.
 */
export const FONT_FAMILIES = [
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica / Arial', pdfLib: 'Helvetica' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman', pdfLib: 'Times-Roman' },
  { value: '"Courier New", Courier, monospace', label: 'Courier New', pdfLib: 'Courier' },
  { value: 'Georgia, serif', label: 'Georgia', pdfLib: 'Times-Roman' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana', pdfLib: 'Helvetica' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial', pdfLib: 'Helvetica' },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma', pdfLib: 'Helvetica' },
];

/**
 * Map a font family CSS value to a pdf-lib standard font name.
 */
export function getPdfLibFontName(fontFamily: string): string {
  const match = FONT_FAMILIES.find(f => f.value === fontFamily);
  return match?.pdfLib ?? 'Helvetica';
}

export const FONT_WEIGHTS = [
  { value: 'normal', label: 'Regular', css: 400 },
  { value: 'medium', label: 'Medium', css: 500 },
  { value: 'semibold', label: 'SemiBold', css: 600 },
  { value: 'bold', label: 'Bold', css: 700 },
];

/**
 * Font sizes in canvas pixels (PDF_RENDER_SCALE × PDF pt).
 * The "pt" values are common PDF document sizes (8–72pt).
 * Stored as canvas px = pt × 3 so CSS rendering and PDF export are consistent.
 */
export const FONT_SIZES: { canvasPx: number; ptLabel: string }[] = [
  { canvasPx: 21, ptLabel: '7pt' },
  { canvasPx: 24, ptLabel: '8pt' },
  { canvasPx: 27, ptLabel: '9pt' },
  { canvasPx: 30, ptLabel: '10pt' },
  { canvasPx: 33, ptLabel: '11pt' },
  { canvasPx: 36, ptLabel: '12pt' },
  { canvasPx: 42, ptLabel: '14pt' },
  { canvasPx: 48, ptLabel: '16pt' },
  { canvasPx: 54, ptLabel: '18pt' },
  { canvasPx: 60, ptLabel: '20pt' },
  { canvasPx: 72, ptLabel: '24pt' },
  { canvasPx: 84, ptLabel: '28pt' },
  { canvasPx: 96, ptLabel: '32pt' },
  { canvasPx: 108, ptLabel: '36pt' },
  { canvasPx: 144, ptLabel: '48pt' },
  { canvasPx: 216, ptLabel: '72pt' },
];

/** Convert canvas pixels back to approximate PDF points */
export const canvasPxToPt = (px: number) => Math.round(px / PDF_RENDER_SCALE);

export const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00AA00', '#0000FF',
  '#FFFF00', '#FF6600', '#800080', '#006666', '#A52A2A',
  '#333333', '#666666', '#999999', '#CCCCCC', '#1A237E',
];

export type Tool =
  | 'select'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'brush'
  | 'highlight'
  | 'underline'
  | 'eraser'
  | 'image'
  | 'watermark'
  | 'pan'
  | 'redact';

export interface RedactElement extends EditorElement {
  type: 'redact';
  fillColor: string;
}

export const BRUSH_SIZES = [2, 4, 8, 12, 16, 24, 32];
export const ERASER_SIZES = [10, 20, 30, 40, 50];
