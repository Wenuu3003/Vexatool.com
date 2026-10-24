/**
 * Sitemap Generation Script
 * 
 * This script automatically generates sitemap.xml from the routes configuration.
 * 
 * Usage:
 *   - Manual: npx tsx scripts/generate-sitemap.ts
 *   - In package.json build script: Run before vite build
 *   
 * The script reads all routes from src/config/routes.ts and generates
 * a valid sitemap.xml in the public directory.
 */

import { generateSitemapXml } from '../src/config/routes.ts';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://vexatool.com';

/**
 * Fetch published programmatic SEO pages from Supabase and return
 * <url> blocks ready to be appended to the static sitemap.
 * Falls back to an empty string (with a warning) if Supabase is unreachable
 * so the build never breaks because of a transient network issue.
 */
async function fetchProgrammaticSeoUrls(staticPaths: Set<string>, environment: Record<string, string | undefined>): Promise<string | null> {
  const url = environment.VITE_SUPABASE_URL;
  const key = environment.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn('⚠️  Supabase env vars missing; skipping programmatic SEO sitemap entries.');
    return null;
  }

  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await sb
      .from('programmatic_seo_pages')
      .select('slug, updated_at')
      .eq('is_published', true)
      .abortSignal(AbortSignal.timeout(10000));

    if (error) {
      console.warn('⚠️  Could not fetch programmatic SEO pages:', error.message);
      return null;
    }
    if (!data || data.length === 0) return '';

    const seen = new Set<string>();
    const blocks: string[] = [];
    for (const row of data as Array<{ slug: string; updated_at: string }>) {
      const slug = row.slug?.trim();
      if (slug === "background-remover" || slug === "background-remover-perfect-product-photos") continue;
      if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) continue;
      const routePath = `/${slug}`;
      // Avoid duplicating any URL that already exists in the static sitemap.
      if (staticPaths.has(routePath) || seen.has(slug)) continue;
      seen.add(slug);
      const lastmod = row.updated_at?.slice(0, 10);
      const validDate = lastmod && /^\d{4}-\d{2}-\d{2}$/.test(lastmod) && Number.isFinite(Date.parse(lastmod)) && Date.parse(lastmod) <= Date.now();
      blocks.push(`  <url>
    <loc>${BASE_URL}/${slug}</loc>
    ${validDate ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }
    console.log(`   ➕ Added ${blocks.length} programmatic SEO URL(s).`);
    return blocks.join('\n');
  } catch (e) {
    console.warn('⚠️  Programmatic SEO fetch failed:', (e as Error).message);
    return null;
  }
}

function extractStaticPaths(sitemap: string): Set<string> {
  const paths = new Set<string>();
  const re = /<loc>([^<]+)<\/loc>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sitemap)) !== null) {
    const loc = m[1];
    const p = loc.replace(BASE_URL, '') || '/';
    paths.add(p);
  }
  return paths;
}

export const generateSitemap = async (environment: Record<string, string | undefined> = process.env) => {
  console.log('🗺️  Generating sitemap.xml...');

  let sitemap = generateSitemapXml();
  const staticPaths = extractStaticPaths(sitemap);

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  let pseoBlocks = await fetchProgrammaticSeoUrls(staticPaths, environment);
  if (pseoBlocks === null && fs.existsSync(outputPath)) {
    // Preserve the last published snapshot during unavailable database access.
    const existing = fs.readFileSync(outputPath, 'utf-8');
    const seen = new Set<string>();
    pseoBlocks = (existing.match(/<url>[\s\S]*?<\/url>/g) || []).filter(block => {
      const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
      if (!loc?.startsWith(BASE_URL + '/')) return false;
      const routePath = loc.slice(BASE_URL.length);
      if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(routePath) || staticPaths.has(routePath) || ['/auth', '/account', '/background-remover'].includes(routePath) || seen.has(routePath)) return false;
      seen.add(routePath);
      return true;
    }).join('\n');
    console.warn('Using last-known dynamic sitemap entries; publication status was not refreshed.');
  }
  if (pseoBlocks) {
    sitemap = sitemap.replace('</urlset>', `${pseoBlocks}\n</urlset>`);
  }

  fs.writeFileSync(outputPath, sitemap, 'utf-8');

  const urlCount = (sitemap.match(/<url>/g) || []).length;
  const timestamp = new Date().toISOString();

  console.log(`✅ Sitemap generated successfully!`);
  console.log(`   📍 Location: ${outputPath}`);
  console.log(`   📊 Total URLs: ${urlCount}`);
  console.log(`   🕒 Generated at: ${timestamp}`);

  // Validate sitemap structure
  if (!sitemap.includes('<?xml version="1.0"')) {
    console.error('❌ Warning: Invalid XML declaration');
  }
  if (!sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    console.error('❌ Warning: Missing sitemap namespace');
  }

  return urlCount;
};

// Run the script
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) generateSitemap().catch((error) => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
