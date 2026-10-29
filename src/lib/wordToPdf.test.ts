import { describe, expect, it } from 'vitest';
import { nextWordPageBreak } from './wordToPdf';

describe('Word PDF pagination', () => {
  it('keeps table rows together when a row fits on the next page', () => {
    expect(nextWordPageBreak(48, 1000, 2400, [300, 750, 1000, 1100])).toBe(1000);
  });
  it('keeps the final short page without adding a blank page', () => {
    expect(nextWordPageBreak(1000, 1000, 1500, [1100, 1450])).toBe(1500);
  });
  it('makes progress even for a paragraph taller than a page', () => {
    expect(nextWordPageBreak(48, 1000, 3000, [2500])).toBe(1048);
  });
});