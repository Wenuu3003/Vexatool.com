import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { routes, generateSitemapXml, isProgrammaticSitemapPath } from './routes';

// Private pages and legacy photo URLs intentionally stay out of search indexes.
// The photo URLs forward visitors to /image-resizer with a preset selected.
const excludedPaths = [
  '/auth', '/account', '/whatsapp-dp-resize', '/aadhaar-photo-resize',
  '/govt-job-photo-resize', '/passport-photo-resize',
];

describe('sitemap coverage', () => {
  it.each([...excludedPaths, '/background-remover', '/background-remover-perfect-product-photos', '/tools', '/admin'])('never restores excluded %s as a dynamic sitemap entry', path => {
    expect(isProgrammaticSitemapPath(path)).toBe(false);
  });
  it('keeps QR category static and admits valid dynamic guides', () => {
    expect(routes.find(route => route.path === '/qr-tools')?.includeInSitemap).toBe(true);
    expect(isProgrammaticSitemapPath('/qr-tools')).toBe(false);
    expect(isProgrammaticSitemapPath('/compress-pdf-to-200kb')).toBe(true);
    expect(isProgrammaticSitemapPath('/missing/nested')).toBe(false);
  });
  it('includes every indexable static public app route exactly once', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    const paths = [...app.matchAll(/<Route path="([^"]+)"/g)].map(m => m[1]).filter(p => !p.includes(':') && !p.includes('*') && !excludedPaths.includes(p));
    const included = routes.filter(r => r.includeInSitemap).map(r => r.path);
    expect(new Set(included).size).toBe(included.length);
    for (const path of paths) expect(included).toContain(path);
    expect(included).not.toContain('/auth'); expect(included).not.toContain('/account');
  });
  it.each(excludedPaths)('excludes %s from configured, generated and published sitemap entries', (path) => {
    expect(routes.filter(r => r.includeInSitemap).map(r => r.path)).not.toContain(path);
    for (const xml of [generateSitemapXml(), readFileSync('public/sitemap.xml', 'utf8')]) {
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      expect(doc.querySelector('parsererror')).toBeNull();
      const paths = Array.from(doc.querySelectorAll('loc'), loc => new URL(loc.textContent || '').pathname);
      expect(paths).not.toContain(path);
    }
  });
  it('generates valid XML with only canonical HTTPS URLs', () => {
    const doc = new DOMParser().parseFromString(generateSitemapXml(), 'application/xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    for (const loc of doc.querySelectorAll('loc')) expect(loc.textContent).toMatch(/^https:\/\/vexatool\.com(?:\/[^?#]*)?$/);
  });
});
