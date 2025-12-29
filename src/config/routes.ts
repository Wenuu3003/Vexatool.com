// Central route configuration for sitemap generation and app routing
export interface RouteConfig {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  includeInSitemap: boolean;
}

export const routes: RouteConfig[] = [
  // Main pages
  { path: '/', priority: 1.0, changefreq: 'daily', includeInSitemap: true },
  { path: '/auth', priority: 0.3, changefreq: 'monthly', includeInSitemap: false },
  { path: '/account', priority: 0.3, changefreq: 'monthly', includeInSitemap: false },
  
  // Utility Tools - High priority
  { path: '/qr-code-scanner', priority: 0.9, changefreq: 'weekly', includeInSitemap: true },
  { path: '/qr-code-generator', priority: 0.9, changefreq: 'weekly', includeInSitemap: true },
  { path: '/currency-converter', priority: 0.8, changefreq: 'daily', includeInSitemap: true },
  { path: '/seo-tool', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/tags-generator', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/calculator', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  
  // AI Tools - High priority
  { path: '/ai-chat', priority: 0.9, changefreq: 'weekly', includeInSitemap: true },
  { path: '/ai-search', priority: 0.9, changefreq: 'weekly', includeInSitemap: true },
  { path: '/ai-text-generator', priority: 0.9, changefreq: 'weekly', includeInSitemap: true },
  { path: '/ai-grammar-tool', priority: 0.9, changefreq: 'weekly', includeInSitemap: true },
  { path: '/ai-resume-builder', priority: 0.9, changefreq: 'weekly', includeInSitemap: true },
  { path: '/hashtag-generator', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/youtube-generator', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/word-counter', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  
  // Calculator Tools
  { path: '/age-calculator', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/bmi-calculator', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/emi-calculator', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/gst-calculator', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/unit-converter', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  
  // Image Tools
  { path: '/image-resizer', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/image-format-converter', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  
  // PDF Tools
  { path: '/merge-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/split-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/compress-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/pdf-to-word', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/edit-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/sign-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/watermark-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/rotate-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/unlock-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/protect-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/organize-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/repair-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/pdf-to-image', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/pdf-to-jpg', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/pdf-to-png', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/pdf-to-html', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/pdf-to-powerpoint', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/pdf-to-excel', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  
  // Image Tools
  { path: '/image-to-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/jpg-to-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/png-to-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/compress-image', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/file-compressor', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/background-remover', priority: 0.9, changefreq: 'weekly', includeInSitemap: true },
  
  // Document Converters
  { path: '/word-to-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/word-to-excel', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/excel-to-word', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/html-to-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/ppt-to-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/excel-to-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
  { path: '/google-drive-to-pdf', priority: 0.8, changefreq: 'weekly', includeInSitemap: true },
];

export const BASE_URL = 'https://mypdfs.in';

export const generateSitemapXml = (): string => {
  const today = new Date().toISOString().split('T')[0];
  
  const urls = routes
    .filter(route => route.includeInSitemap)
    .map(route => `  <url>
    <loc>${BASE_URL}${route.path === '/' ? '' : route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
};
