import { afterEach, describe, expect, it, vi } from 'vitest';
import { imageToPng } from './imageToPng';
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('image decoder failures', () => {
  for (const mode of ['error', 'timeout'] as const) it(`rejects ${mode} and releases the URL`, async () => {
    vi.useFakeTimers();
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:test', revokeObjectURL });
    const img = { onload: null, onerror: null, removeAttribute: vi.fn(), set src(_: string) { if (mode === 'error') queueMicrotask(() => (this.onerror as unknown as () => void)?.()); } };
    vi.spyOn(document, 'createElement').mockReturnValue(img as unknown as HTMLImageElement);
    const result = expect(imageToPng(new Blob(['bad']))).rejects.toThrow(mode === 'error' ? /corrupt/ : /timed out/);
    await vi.advanceTimersByTimeAsync(15000);
    await result;
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
    expect(img.onload).toBeNull();
    expect(img.onerror).toBeNull();
  });
});
