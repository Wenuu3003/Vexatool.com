import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { routes, generateSitemapXml } from './routes';
describe('sitemap coverage', () => {
  it('includes every static public app route exactly once', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    const paths = [...app.matchAll(/<Route path="([^"]+)"/g)].map(m => m[1]).filter(p => !p.includes(':') && !p.includes('*') && !['/auth', '/account'].includes(p));
    const included = routes.filter(r => r.includeInSitemap).map(r => r.path);
    expect(new Set(included).size).toBe(included.length);
    for (const path of paths) expect(included).toContain(path);
    expect(included).not.toContain('/auth'); expect(included).not.toContain('/account');
  });
  it('generates valid XML with only canonical HTTPS URLs', () => {
    const doc = new DOMParser().parseFromString(generateSitemapXml(), 'application/xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    for (const loc of doc.querySelectorAll('loc')) expect(loc.textContent).toMatch(/^https:\/\/vexatool\.com(?:\/[^?#]*)?$/);
  });
});
