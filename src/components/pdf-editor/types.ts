// PDF Editor Types

export interface Point {
  x: number;
  y: number;
}

export interface EditorElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'drawing' | 'watermark';
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
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
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
  drawingType: 'pen' | 'highlight' | 'underline';
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

export type AnyElement = TextElement | ShapeElement | ImageElement | DrawingElement | WatermarkElement;

export interface HistoryState {
  elements: AnyElement[];
  pages: PageInfo[];
}

export interface PageInfo {
  pageNumber: number;
  rotation: number;
  deleted: boolean;
  canvas?: HTMLCanvasElement;
  width: number;
  height: number;
}

export interface ZoomLevel {
  value: number;
  label: string;
}

export const ZOOM_LEVELS: ZoomLevel[] = [
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1, label: '100%' },
  { value: 1.25, label: '125%' },
  { value: 1.5, label: '150%' },
  { value: 2, label: '200%' },
];

export const FONT_FAMILIES = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times-Roman', label: 'Times New Roman' },
  { value: 'Courier', label: 'Courier' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
];

export const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

export const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#008000', '#000080', '#808080', '#C0C0C0', '#A52A2A',
];

export type Tool = 
  | 'select'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'highlight'
  | 'underline'
  | 'image'
  | 'watermark'
  | 'pan';
