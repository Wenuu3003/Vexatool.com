import { describe, it, expect } from "vitest";
import { blogPosts as sitemapBlogSlugs } from "@/config/routes";
import { allBlogContent, legacyBlogRedirects } from "./BlogPost";

/**
 * Regression guard for the blog router.
 *
 * If this test fails, a blog slug listed in `src/config/routes.ts` (and therefore
 * in the sitemap) does not resolve to a content entry in BlogPost.tsx — clicking
 * the card on /blog would silently redirect to /blog instead of opening the post.
 *
 * Add the missing slug to one of:
 *   - src/data/blogContent.tsx
 *   - src/data/expandedBlogPosts.tsx
 *   - src/data/phase3BlogPosts.tsx
 *   - src/data/mergePdfBlogContent.tsx
 * or remove it from `blogPosts` in src/config/routes.ts.
 */
describe("Blog router regression", () => {
  it("every sitemap blog slug resolves to a content entry", () => {
    const missing = sitemapBlogSlugs.filter((slug) => !allBlogContent[slug]);
    expect(missing, `Missing blog content for: ${missing.join(", ")}`).toEqual([]);
  });

  it("every content entry has a title, date, readTime and content", () => {
    const broken: string[] = [];
    for (const [slug, post] of Object.entries(allBlogContent)) {
      if (!post?.title || !post?.date || !post?.readTime || !post?.content) {
        broken.push(slug);
      }
    }
    expect(broken, `Incomplete blog post entries: ${broken.join(", ")}`).toEqual([]);
  });

  it("legacy redirect targets resolve to a real post", () => {
    const broken = Object.entries(legacyBlogRedirects).filter(
      ([, target]) => !allBlogContent[target],
    );
    expect(
      broken,
      `Legacy redirects pointing to missing slugs: ${broken
        .map(([from, to]) => `${from} -> ${to}`)
        .join(", ")}`,
    ).toEqual([]);
  });

  it("includes the split Love/Age posts and the legacy combined slug redirect", () => {
    expect(allBlogContent["love-calculator-guide"]).toBeDefined();
    expect(allBlogContent["age-calculator-guide"]).toBeDefined();
    expect(legacyBlogRedirects["love-age-calculator-complete-guide"]).toBe(
      "love-calculator-guide",
    );
  });

  it("includes all 9 Phase 3 slugs", () => {
    const phase3 = [
      "secure-pdf-processing-browser-based",
      "pdf-vs-word-when-to-use-each",
      "best-free-document-conversion-tools",
      "digital-privacy-guide-file-safety",
      "student-guide-to-pdf-tools",
      "business-document-workflow-guide",
      "batch-processing-documents-guide",
      "image-optimization-for-seo",
      "convert-images-to-pdf-online",
    ];
    const missing = phase3.filter((slug) => !allBlogContent[slug]);
    expect(missing, `Phase 3 slugs missing: ${missing.join(", ")}`).toEqual([]);
  });
});