export interface SignatureObject {
  id: string;
  type: 'draw' | 'type';
  dataUrl?: string; // For drawn signatures
  text?: string; // For typed signatures
  pageIndex: number; // Which page (0-based)
  x: number; // Position relative to page (0-1 ratio)
  y: number; // Position relative to page (0-1 ratio)
  width: number; // Size relative to page (0-1 ratio)
  height: number; // Size relative to page (0-1 ratio)
  locked: boolean;
}

export interface PageDimensions {
  width: number;
  height: number;
}
