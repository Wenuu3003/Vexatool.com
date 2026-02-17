export type SignatureFontStyle = 'script' | 'cursive' | 'formal';

export const SIGNATURE_FONTS: Record<SignatureFontStyle, { label: string; fontFamily: string; className: string }> = {
  script: { label: 'Script', fontFamily: "'Dancing Script', cursive", className: 'italic' },
  cursive: { label: 'Cursive', fontFamily: "'Caveat', cursive", className: '' },
  formal: { label: 'Formal', fontFamily: "'Times New Roman', 'Georgia', serif", className: 'italic' },
};

export interface SignatureObject {
  id: string;
  type: 'draw' | 'type';
  dataUrl?: string;
  text?: string;
  fontStyle?: SignatureFontStyle;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
}

export interface PageDimensions {
  width: number;
  height: number;
}
