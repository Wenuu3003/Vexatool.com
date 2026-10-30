import teluguUrl from '@/assets/fonts/telugu.woff2?url';
import devanagariUrl from '@/assets/fonts/devanagari.woff2?url';

export const exportFontFamily = '"Vexa Telugu", "Vexa Devanagari", Arial, sans-serif';
export function exportFontCss() {
  return `@font-face { font-family: "Vexa Telugu"; src: url("${new URL(teluguUrl, location.href).href}") format("woff2"); } @font-face { font-family: "Vexa Devanagari"; src: url("${new URL(devanagariUrl, location.href).href}") format("woff2"); }`;
}
const loaded = new Map<string, Promise<void>>();
export async function prepareTextFonts(text: string, target: Document = document) {
  for (const [name, url, needed] of [
    ['Vexa Telugu', teluguUrl, /[\u0C00-\u0C7F]/.test(text)],
    ['Vexa Devanagari', devanagariUrl, /[\u0900-\u097F]/.test(text)],
  ] as const) {
    if (!needed) continue;
    if (target !== document) {
      const Face = (target.defaultView as unknown as {FontFace: typeof FontFace})?.FontFace || FontFace;
      const face = await new Face(name, `url("${url}")`).load();
      target.fonts.add(face);
      continue;
    }
    if (!loaded.has(name)) {
      loaded.set(name, (async () => {
        const face = await new FontFace(name, `url("${url}")`).load();
        document.fonts.add(face);
      })().catch(error => { loaded.delete(name); throw error; }));
    }
    await loaded.get(name);
  }
}

/** Browser shaping keeps Telugu/Hindi conjuncts intact in exported images. */
export async function textPng(text: string, size = 48) {
  await prepareTextFonts(text);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image rendering is unavailable in this browser.');
  context.font = `${size}px ${exportFontFamily}`;
  const measure = context.measureText(text);
  const left = Math.max(0, measure.actualBoundingBoxLeft || 0);
  const right = Math.max(measure.width, measure.actualBoundingBoxRight || 0);
  const top = Math.max(size, measure.actualBoundingBoxAscent || 0);
  const bottom = Math.max(size * .4, measure.actualBoundingBoxDescent || 0);
  const padding = 4;
  const width = Math.ceil(left + right + padding * 2);
  const height = Math.ceil(top + bottom + padding * 2);
  const scale = Math.min(2, 8192 / width);
  canvas.width = Math.max(1, Math.ceil(width * scale));
  canvas.height = Math.max(1, Math.ceil(height * scale));
  context.scale(scale, scale);
  context.font = `${size}px ${exportFontFamily}`;
  context.fillStyle = '#666666';
  context.fillText(text, padding + left, padding + top);
  const blob = await new Promise<Blob>((resolve,reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Text rendering failed.')), 'image/png'));
  return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
}
