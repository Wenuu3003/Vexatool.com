/** Convert extracted PDF text into real Excel numbers where it is safe to do so. */
export type TypedCell = { value: string | number; numFmt?: string };

const NUMBER_RE = /^[-+]?(\d{1,3}(,\d{2,3})+|\d+)(\.\d+)?$/;

export function toTypedCell(raw: string): TypedCell {
  const text = raw.trim();
  if (!text) return { value: '' };
  // Keep IDs, phone numbers, account numbers and PIN codes exactly as written.
  if (/^0\d/.test(text) || /^\d{11,}$/.test(text.replace(/,/g, ''))) return { value: text };
  let s = text, negative = false, percent = false, currency = '';
  if (/^\(.*\)$/.test(s)) { negative = true; s = s.slice(1, -1).trim(); }
  if (/\s?(CR|Cr)$/.test(s)) s = s.replace(/\s?(CR|Cr)$/, '');
  else if (/\s?(DR|Dr)$/.test(s)) { negative = true; s = s.replace(/\s?(DR|Dr)$/, ''); }
  const cur = s.match(/^(₹|\$|€|£|Rs\.?|INR)\s?/);
  if (cur) { currency = cur[1]; s = s.slice(cur[0].length); }
  if (s.endsWith('%')) { percent = true; s = s.slice(0, -1).trim(); }
  if (s.startsWith('-')) { negative = !negative; s = s.slice(1); }
  if (!NUMBER_RE.test(s)) return { value: text };
  let n = Number(s.replace(/,/g, ''));
  if (!Number.isFinite(n)) return { value: text };
  if (negative) n = -n;
  const decimals = (s.split('.')[1] || '').length;
  const base = (s.includes(',') || currency ? '#,##0' : '0') + (decimals ? '.' + '0'.repeat(decimals) : '');
  if (percent) return { value: n / 100, numFmt: base.replace('#,##', '') + '%' };
  const sym = currency === '₹' || /^(Rs|INR)/.test(currency) ? '"₹"' : currency ? `"${currency}"` : '';
  return { value: n, numFmt: sym ? `${sym}${base}` : base === '0' ? undefined : base };
}
