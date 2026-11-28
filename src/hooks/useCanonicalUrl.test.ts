import { describe, expect, it } from 'vitest';
import { getCanonicalUrl } from './useCanonicalUrl';

describe('canonical URL normalization', () => {
  it('uses one QR category address for trailing-slash variants', () => {
    expect(getCanonicalUrl('/qr-tools/')).toBe('https://vexatool.com/qr-tools');
    expect(getCanonicalUrl('/qr-tools')).toBe('https://vexatool.com/qr-tools');
  });
  it('does not index image-resizer preset query variants separately', () => {
    expect(getCanonicalUrl('/image-resizer?mode=passport#upload')).toBe('https://vexatool.com/image-resizer');
  });
  it('preserves the canonical root', () => {
    expect(getCanonicalUrl('/')).toBe('https://vexatool.com');
  });
});