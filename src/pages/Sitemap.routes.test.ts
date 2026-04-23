import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { blogPosts as sitemapBlogSlugs } from "@/config/routes";
import { allBlogContent, legacyBlogRedirects } from "./BlogPost";

/**
 * Deploy-time guard for `public/sitemap.xml`.
 *
 * Parses the static sitemap that ships with every build and verifies:
 *  1. Every `/blog/<slug>` URL has a matching content entry in BlogPost.tsx
 *  2. Every blog slug declared in `src/config/routes.ts` is present in the sitemap
 *  3. No legacy redirect source is accidentally still listed in the sitemap
 *  4. Every legacy redirect target IS present in the sitemap (so 301s don't 404)
 */

const SITE_ORIGIN = "https://vexatool.com";
const sitemapPath = resolve(process.cwd(), "public/sitemap.xml");
const sitemapXml = readFileSync(sitemapPath, "utf-8");

const sitemapUrls = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(
  (m) => m[1].trim(),
);

const blogUrlPrefix = `${SITE_ORIGIN}/blog/`;
const sitemapBlogSlugsFromXml = sitemapUrls
  .filter((u) => u.startsWith(blogUrlPrefix))
  .map((u) => u.slice(blogUrlPrefix.length));

describe("public/sitemap.xml regression", () => {
  it("every /blog/<slug> URL in the sitemap resolves to a content entry", () => {
    const missing = sitemapBlogSlugsFromXml.filter((slug) => !allBlogContent[slug]);
    expect(
      missing,
      `Sitemap lists blog URLs without content: ${missing.join(", ")}. ` +
        `Add the post or remove it from public/sitemap.xml.`,
    ).toEqual([]);
  });

  it("every blog slug from routes.ts is listed in the sitemap", () => {
    const set = new Set(sitemapBlogSlugsFromXml);
    const missing = sitemapBlogSlugs.filter((slug) => !set.has(slug));
    expect(
      missing,
      `Slugs in routes.ts missing from public/sitemap.xml: ${missing.join(", ")}. ` +
        `Run \`npm run generate:sitemap\` or update public/sitemap.xml.`,
    ).toEqual([]);
  });

  it("legacy redirect source slugs are NOT advertised in the sitemap", () => {
    const set = new Set(sitemapBlogSlugsFromXml);
    const leaked = Object.keys(legacyBlogRedirects).filter((slug) => set.has(slug));
    expect(
      leaked,
      `Legacy redirect sources should not be in the sitemap: ${leaked.join(", ")}.`,
    ).toEqual([]);
  });

  it("every legacy redirect target IS present in the sitemap", () => {
    const set = new Set(sitemapBlogSlugsFromXml);
    const broken = Object.entries(legacyBlogRedirects)
      .filter(([, target]) => !set.has(target))
      .map(([from, to]) => `${from} -> ${to}`);
    expect(
      broken,
      `Legacy redirects point to slugs missing from the sitemap: ${broken.join(", ")}.`,
    ).toEqual([]);
  });

  it("sitemap contains no duplicate URLs", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const url of sitemapUrls) {
      if (seen.has(url)) dupes.push(url);
      seen.add(url);
    }
    expect(dupes, `Duplicate sitemap URLs: ${dupes.join(", ")}`).toEqual([]);
  });
});