import { describe, expect, it } from 'vitest';
import { nextWordPageBreak } from './wordToPdf';

describe('Word PDF pagination', () => {
  it('breaks before the next multiline row rather than splitting its address', () => {
    expect(nextWordPageBreak(96, 700, 2600, [96, 130, 760, 810])).toBe(760);
    expect(nextWordPageBreak(760, 700, 2600, [810, 1400, 1480])).toBe(1400);
  });
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