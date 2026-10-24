import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { upscPhotoGuide, upscSources } from "@/data/upscPhotoGuide";
import NotFound from "@/pages/NotFound";

interface PSeoPage {
  slug: string;
  category: string;
  parent_tool_slug: string | null;
  seo_title: string;
  meta_description: string;
  h1: string;
  intro_md: string;
  sections: { heading: string; body_md: string }[];
  faqs: { q: string; a: string }[];
  internal_links: { href: string; label: string }[];
  breadcrumbs: { name: string; href: string }[];
  canonical_url: string | null;
}

/**
 * Slugs that belong to real application routes/sections and must never be
 * resolved by the dynamic `/:slug` programmatic SEO route. If a request hits
 * one of these we render NotFound immediately and skip the DB lookup so the
 * real route (defined elsewhere in the router) always wins.
 */
const RESERVED_SLUGS = new Set<string>([
  "background-remover",
  "auth",
  "account",
  "dashboard",
  "admin",
  "tools",
  "image-tools",
  "pdf-tools",
  "calculators",
  "converters",
  "api",
]);

/**
 * Renders any DB-backed programmatic SEO page mounted at `/:slug`.
 * If the slug is not found (or unpublished) we route the user to 404 so
 * existing tool routes and statically-defined paths keep working.
 */
export default function ProgrammaticSEOPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PSeoPage | null | undefined>(undefined);

  useEffect(() => {
    if (slug === "upsc-photo-resizer") { setPage(upscPhotoGuide); return; }
    setPage(undefined);
    if (!slug || RESERVED_SLUGS.has(slug)) {
      setPage(null);
      return;
    }
    let cancelled = false;
    (async () => {
      // Cast to bypass generated types until the migration is applied and
      // src/integrations/supabase/types.ts is regenerated.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("programmatic_seo_pages")
        .select(
          "slug, category, parent_tool_slug, seo_title, meta_description, h1, intro_md, sections, faqs, internal_links, breadcrumbs, canonical_url"
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setPage(null);
        return;
      }
      setPage({ ...data, internal_links: data.internal_links.filter((link: {href: string}) => link.href.split(/[?#]/)[0] !== "/background-remover") } as PSeoPage);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (page === undefined) {
    return (
      <>
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-label="Loading" />
        </div>
      </>
    );
  }
  if (page === null) {
    return (
      <>
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <NotFound />
      </>
    );
  }

  const canonical = page.canonical_url ?? `https://vexatool.com/${page.slug}`;
  // Exam guides do not define a verified exam-specific preset.
  // Open custom sizing instead of silently applying the generic govt dimensions.
  const customPhotoGuide = page.slug === "upsc-photo-resizer" || ["govt-job-photo-resize", "passport-photo-resize", "aadhaar-photo-resize"].includes(page.parent_tool_slug ?? "");
  const toolHref = customPhotoGuide ? "/image-resizer" : `/${page.parent_tool_slug}`;
  const breadcrumbs = page.breadcrumbs
    .filter((b, i, list) => i === list.length - 1 || !list.slice(0, i).some((previous) => previous.href === b.href))
    .map((b, i, list) => i === list.length - 1 ? { ...b, href: canonical } : b);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbsJsonLd = breadcrumbs.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: b.href.startsWith("http") ? b.href : `https://vexatool.com${b.href}`,
        })),
      }
    : null;

  return (
    <>
      <Helmet>
        <title>{page.seo_title}</title>
        <meta name="description" content={page.meta_description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={page.seo_title} />
        <meta property="og:description" content={page.meta_description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.seo_title} />
        <meta name="twitter:description" content={page.meta_description} />
        {page.faqs.length > 0 && (
          <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        )}
        {breadcrumbsJsonLd && (
          <script type="application/ld+json">{JSON.stringify(breadcrumbsJsonLd)}</script>
        )}
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1" role="main">
          <article className="container mx-auto px-4 py-10 max-w-3xl">
            {breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
                {breadcrumbs.map((b, i) => (
                  <span key={b.href}>
                    {i > 0 && <span className="mx-1.5">/</span>}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="text-foreground">{b.name}</span>
                    ) : (
                      <Link to={b.href} className="hover:text-primary">{b.name}</Link>
                    )}
                  </span>
                ))}
              </nav>
            )}

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              {page.h1}
            </h1>
            <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-line mb-8">
              {page.intro_md}
            </p>

            {page.parent_tool_slug && (
              <div className="mb-8">
                <Link
                  to={toolHref}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  {customPhotoGuide ? "Open Image Resizer — Custom Dimensions" : "Open the Tool"}
                </Link>
                {customPhotoGuide && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    This guide uses the shared Image Resizer. Enter dimensions and a file-size target from your current application instructions; no exam-specific preset is applied.
                  </p>
                )}
              </div>
            )}

            {page.slug === "upsc-photo-resizer" && <section className="mb-8"><h2 className="text-xl font-semibold mb-3">Official sources</h2><ul className="space-y-2">{upscSources.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="text-primary underline">{source.label}</a></li>)}</ul></section>}
            {page.sections.map((s) => (
              <section key={s.heading} className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-3">{s.heading}</h2>
                <div className="text-foreground/85 leading-relaxed whitespace-pre-line">
                  {s.body_md}
                </div>
              </section>
            ))}

            {page.faqs.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {page.faqs.map((f) => (
                    <details
                      key={f.q}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <summary className="font-medium text-foreground cursor-pointer">{f.q}</summary>
                      <p className="mt-2 text-foreground/80 leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {page.internal_links.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Related Tools</h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {page.internal_links.map((l) => (
                    <li key={l.href}>
                      <Link to={l.href} className="block px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
