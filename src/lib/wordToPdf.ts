import { PDFDocument } from 'pdf-lib';

/** Choose a row/paragraph boundary instead of cutting ordinary content in half. */
export function nextWordPageBreak(start: number, limit: number, end: number, boundaries: number[]): number {
  const maximum = Math.min(start + limit, end);
  if (maximum === end) return end;
  const safe = boundaries.filter(value => value > start + limit * 0.25 && value <= maximum);
  return safe.length ? Math.max(...safe) : maximum;
}

/** Render locally in an isolated document so site CSS cannot alter Word layout. */
export async function convertWordToPdf(file: File, onProgress: (value: number, label: string) => void) {
  const [{ renderAsync }, { default: html2canvas }] = await Promise.all([
    import('docx-preview'), import('html2canvas'),
  ]);
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-100000px;top:0;width:1000px;height:2000px;border:0;pointer-events:none;';
  document.body.append(frame);
  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error('Could not initialize the document renderer.');
    doc.open(); doc.write('<!doctype html><html><head></head><body></body></html>'); doc.close();
    const container = doc.createElement('div');
    doc.body.append(container);
    onProgress(20, 'Reading document layout...');
    if (file.name.toLowerCase().endsWith('.txt')) {
      const text = await file.text();
      if (!text.trim()) throw new Error('The text file is empty.');
      const section = doc.createElement('section');
      section.className = 'vexa-word';
      section.style.cssText = 'box-sizing:border-box;width:794px;min-height:1123px;padding:48px;font:15px Arial;background:white;color:black;';
      for (const line of text.split(/\r?\n/)) {
        const p = doc.createElement('p'); p.textContent = line || '\u00a0';
        p.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5;margin:0;padding-bottom:8px;'; section.append(p);
      }
      container.append(section);
    } else {
      await renderAsync(await file.arrayBuffer(), container, doc.head, {
        className: 'vexa-word', inWrapper: false, ignoreWidth: false, ignoreHeight: false,
        ignoreFonts: false, breakPages: true, ignoreLastRenderedPageBreak: false,
        renderHeaders: true, renderFooters: true, renderFootnotes: true, useBase64URL: true,
        renderAltChunks: false, renderChanges: false, renderComments: false,
      });
    }
    await doc.fonts.ready;
    await Promise.all(Array.from(container.querySelectorAll('img')).map(image => image.decode().catch(() => undefined)));
    const sections = Array.from(container.querySelectorAll<HTMLElement>('section.vexa-word'));
    if (!sections.length || !container.textContent?.trim() && !container.querySelector('img,svg')) {
      throw new Error('No supported document content found.');
    }
    const pdf = await PDFDocument.create();
    const preview = Array.from(container.querySelectorAll('p')).map(p => p.textContent).join('\n').trim();
    for (const [index, section] of sections.entries()) {
      onProgress(40 + Math.round(index / sections.length * 45), 'Rendering PDF pages...');
      const style = frame.contentWindow?.getComputedStyle(section);
      const pageHeight = parseFloat(style?.minHeight || '') || 1123;
      const top = parseFloat(style?.paddingTop || '') || 0;
      const bottom = parseFloat(style?.paddingBottom || '') || 0;
      const width = section.getBoundingClientRect().width;
      const height = Math.max(section.scrollHeight, section.offsetHeight);
      const scale = Math.min(2, 8192 / height, Math.sqrt(16000000 / (width * height)));
      const canvas = await html2canvas(section, {
        scale, backgroundColor: '#ffffff', logging: false, useCORS: false,
        width, height, windowWidth: 1000, windowHeight: 2000,
      });
      const origin = section.getBoundingClientRect().top;
      const boundaries = Array.from(section.querySelectorAll('tr,p:not(td p)'))
        .map(element => element.getBoundingClientRect().bottom - origin);
      const contentEnd = height - bottom;
      const capacity = pageHeight - top - bottom;
      if (capacity <= 0 || width <= 0) throw new Error('Invalid Word page dimensions.');
      let cursor = top;
      while (cursor < contentEnd - 0.5) {
        const end = nextWordPageBreak(cursor, capacity, contentEnd, boundaries);
        const pageCanvas = doc.createElement('canvas');
        pageCanvas.width = Math.ceil(width * scale); pageCanvas.height = Math.ceil(pageHeight * scale);
        const ctx = pageCanvas.getContext('2d');
        if (!ctx) throw new Error('Canvas rendering is unavailable.');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        // Preserve the original top margin/header on the first page of each section.
        if (cursor === top && top > 0) ctx.drawImage(canvas, 0, 0, canvas.width, top * scale, 0, 0, canvas.width, top * scale);
        ctx.drawImage(canvas, 0, cursor * scale, canvas.width, (end - cursor) * scale,
          0, top * scale, canvas.width, (end - cursor) * scale);
        if (end === contentEnd && bottom > 0) ctx.drawImage(canvas, 0, contentEnd * scale, canvas.width, bottom * scale,
          0, (pageHeight - bottom) * scale, canvas.width, bottom * scale);
        const image = await pdf.embedPng(pageCanvas.toDataURL('image/png'));
        const page = pdf.addPage([width * 0.75, pageHeight * 0.75]);
        page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
        pageCanvas.width = 0; pageCanvas.height = 0;
        cursor = end;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      canvas.width = 0; canvas.height = 0;
    }
    onProgress(95, 'Finalizing...');
    return { bytes: await pdf.save(), pageCount: pdf.getPageCount(), preview };
  } finally {
    frame.remove();
  }
}