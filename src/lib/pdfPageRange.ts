/** All tokens must be valid: never silently truncate or skip requested pages. */
export function parsePageRange(range: string, maxPages: number): number[] {
  if (!Number.isSafeInteger(maxPages) || maxPages < 1) throw new Error('Invalid page count');
  if (!range.trim()) return Array.from({ length: maxPages }, (_, i) => i);
  const pages = new Set<number>();
  for (const part of range.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('Invalid page range');
    const start = Number(match[1]), end = Number(match[2] ?? match[1]);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end < start || end > maxPages) throw new Error('Invalid page range');
    for (let page = start; page <= end; page++) pages.add(page - 1);
  }
  return [...pages].sort((a, b) => a - b);
}
