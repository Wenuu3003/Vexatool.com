/** Transformers.js RawImage masks contain bytes, not normalized floats. */
export function normalizeMaskBytes(data: ArrayLike<number>, pixels: number): Float32Array {
  if (data.length !== pixels) throw new Error('Mask dimensions do not match image');
  return Float32Array.from(data, value => {
    if (!Number.isFinite(value) || value < 0 || value > 255) throw new Error('Invalid mask value');
    return value / 255;
  });
}
