/** Wrap text including long IDs without silently clipping the right margin. */
export function wrapOfficeText(text: string, width: number, measure: (value: string) => number): string[] {
  const lines: string[] = []; let line = '';
  for (const word of text.split(/\s+/)) {
    if (!word) continue;
    const joined = line ? `${line} ${word}` : word;
    if (measure(joined) <= width) { line = joined; continue; }
    if (line) { lines.push(line); line = ''; }
    for (const char of word) {
      if (line && measure(line + char) > width) { lines.push(line); line = ''; }
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}
export async function extractWordText(file: File): Promise<string> {
  if (file.name.toLowerCase().endsWith('.txt')) return file.text();
  if (!file.name.toLowerCase().endsWith('.docx')) throw new Error('Use DOCX or TXT. Export legacy DOC and RTF from Word first.');
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const source = await zip.file('word/document.xml')?.async('text');
  if (!source) throw new Error('Not a DOCX document.');
  const xml = new DOMParser().parseFromString(source, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Invalid DOCX XML.');
  const ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const text = Array.from(xml.getElementsByTagNameNS(ns, 'p')).map(p => {
    const parts: string[] = [];
    for (const el of Array.from(p.getElementsByTagName('*'))) {
      if (el.namespaceURI !== ns) continue;
      if (el.localName === 't') parts.push(el.textContent || '');
      if (el.localName === 'tab') parts.push(' ');
      if (el.localName === 'br') parts.push('\n');
    }
    return parts.join('');
  }).join('\n').trim();
  if (!text) throw new Error('No supported body text found.');
  return text;
}
