import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { HomepageContent } from "@/components/HomepageContent";
import { ToolsGrid } from "@/components/ToolsGrid";
import { HomepageFAQ } from "@/components/HomepageFAQ";

const Index = () => {
  const canonicalUrl = useCanonicalUrl();

  return (
    <>
      <Helmet>
        <title>Free Online Tools – PDF, Image, QR & More | VexaTool</title>
        <meta name="description" content="VexaTool provides secure and free online PDF editor, QR code generator, image tools and calculators. Fast, easy and mobile-friendly tools for everyone." />
        <meta name="keywords" content="free online tools, PDF editor, QR code generator, image tools, calculator, merge PDF, compress PDF, VexaTool" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "VexaTool",
            "url": "https://vexatool.com",
            "logo": "https://vexatool.com/favicon.png",
            "description": "Free online PDF tools, image tools, QR code generator, and calculators. Secure, fast, browser-based processing.",
            "sameAs": []
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "VexaTool",
            "url": "https://vexatool.com",
            "description": "Free online PDF tools. Merge, edit, compress, split and convert PDFs.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://vexatool.com/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        <meta name="publisher" content="VexaTool" />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Free Online PDF Tools – Secure, Fast & Easy | VexaTool" />
        <meta property="og:description" content="VexaTool provides secure and free online PDF editor, QR code generator, image tools and calculators." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="VexaTool" />
        <meta property="og:image" content="https://vexatool.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online PDF Tools – VexaTool" />
        <meta name="twitter:description" content="Free PDF editor, QR code generator, image tools and calculators." />
        <meta name="twitter:image" content="https://vexatool.com/og-image.png" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1" role="main">
          <Hero />

          <ToolsGrid />

          <HomepageContent />

          {showDeferredContent && (
            <Suspense fallback={null}>
              <HomepageFAQ />
            </Suspense>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
