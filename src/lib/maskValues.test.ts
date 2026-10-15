import { describe, expect, it } from 'vitest';
import { normalizeMaskBytes } from './maskValues';
describe('segmentation mask bytes', () => {
  it('preserves soft edges instead of saturating them', () => {
    const mask = normalizeMaskBytes(new Uint8Array([0, 1, 128, 255]), 4);
    expect(mask[0]).toBe(0); expect(mask[1]).toBeCloseTo(1 / 255);
    expect(mask[2]).toBeCloseTo(128 / 255); expect(mask[3]).toBe(1);
  });
  it('rejects mismatched geometry and invalid values', () => {
    expect(() => normalizeMaskBytes([0], 2)).toThrow();
    expect(() => normalizeMaskBytes([NaN], 1)).toThrow();
  });
});
