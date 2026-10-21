import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke } } }));
import { searchIndiaPost } from './indiaPost';
describe('postal service failures', () => {
  beforeEach(() => { invoke.mockReset(); });
  afterEach(() => vi.useRealTimers());
  it('does not send partial numeric input', async () => { expect(await searchIndiaPost('123')).toEqual([]); expect(invoke).not.toHaveBeenCalled(); });
  it('rejects malformed service data', async () => { invoke.mockResolvedValue({ data: { results: [{pincode:'bad'}] } }); await expect(searchIndiaPost('Chennai')).rejects.toThrow('Invalid postal'); });
  it('distinguishes empty success from service failure', async () => { invoke.mockResolvedValue({ data: { results: [] } }); expect(await searchIndiaPost('Chennai')).toEqual([]); invoke.mockResolvedValue({error:{message:'Unavailable'}}); await expect(searchIndiaPost('Chennai')).rejects.toThrow('Unavailable'); });
  it('bounds a stalled request', async () => { vi.useFakeTimers(); invoke.mockReturnValue(new Promise(() => {})); const result=expect(searchIndiaPost('Chennai')).rejects.toThrow('timed out'); await vi.advanceTimersByTimeAsync(20000); await result; });
});
