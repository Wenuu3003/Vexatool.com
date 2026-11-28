import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

afterEach(cleanup);

describe('missing URL indexing policy', () => {
  it('prevents a nonexistent nested URL from being indexed', async () => {
    render(<MemoryRouter initialEntries={['/not-a-real-page/check']}><NotFound /></MemoryRouter>);
    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    });
  });
});