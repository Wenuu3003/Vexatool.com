import { Header } from "@/components/Header";
import { QuickAccessBar } from "@/components/QuickAccessBar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { lazy, Suspense, useEffect, useState } from "react";
import { HomepageContent } from "@/components/HomepageContent";
import { toolsData } from "@/data/toolsData";
import { Link } from "react-router-dom";

const ToolsGrid = lazy(() =>
  import("@/components/ToolsGrid").then((m) => ({ default: m.ToolsGrid }))
);

const HomepageFAQ = lazy(() =>
  import("@/components/HomepageFAQ").then((m) => ({ default: m.HomepageFAQ }))
);

// Featured PDF tools for hero section
const featuredToolIds = ["merge-pdf", "compress-pdf", "split-pdf", "pdf-to-word", "word-to-pdf", "edit-pdf"];

const Index = () => {
  const canonicalUrl = useCanonicalUrl();
  const [showDeferredContent, setShowDeferredContent] = useState(false);
  const featuredTools = toolsData.filter(t => featuredToolIds.includes(t.id));
  
  useEffect(() => {
    const timer = setTimeout(() => setShowDeferredContent(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Free Online PDF Tools – Secure, Fast & Easy | VexaTool</title>
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
        <QuickAccessBar />
        <main className="flex-1" role="main">
          <Hero />

          {/* Featured PDF Tools */}
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
                Popular PDF Tools
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {featuredTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.href}
                    className="bg-card border border-border rounded-xl p-5 text-center hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <tool.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
          
          <Suspense
            fallback={
              <section className="py-12 md:py-20 bg-background">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-10">
                    <div className="h-10 w-64 mx-auto rounded-lg bg-muted animate-pulse" />
                    <div className="h-6 w-96 mx-auto mt-4 rounded-lg bg-muted animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
                    ))}
                  </div>
                </div>
              </section>
            }
          >
            <ToolsGrid />
          </Suspense>
          
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
