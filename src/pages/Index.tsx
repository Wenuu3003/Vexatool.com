import { Header } from "@/components/Header";
import { QuickAccessBar } from "@/components/QuickAccessBar";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { lazy, Suspense, useEffect, useState } from "react";
import { HomepageContent } from "@/components/HomepageContent";

const ToolsGrid = lazy(() =>
  import("@/components/ToolsGrid").then((m) => ({ default: m.ToolsGrid }))
);

const HomepageFAQ = lazy(() =>
  import("@/components/HomepageFAQ").then((m) => ({ default: m.HomepageFAQ }))
);

const Index = () => {
  const canonicalUrl = useCanonicalUrl();
  const [showDeferredContent, setShowDeferredContent] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowDeferredContent(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>All-in-One Free Online Tools | PDF, QR & Calculator Tools – VexaTool</title>
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
            "description": "All-in-one free online tools. PDF editor, QR code generator, image tools, calculators.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://vexatool.com/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "VexaTool - Free Online Tools",
            "description": "Free online PDF tools, image tools, QR code generator, calculators. No signup required.",
            "url": "https://vexatool.com",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "All",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "1200", "bestRating": "5" },
            "provider": { "@type": "Organization", "name": "VexaTool", "url": "https://vexatool.com" }
          })}
        </script>
        <meta name="publisher" content="VexaTool" />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="All-in-One Free Online Tools | PDF, QR & Calculator Tools – VexaTool" />
        <meta property="og:description" content="VexaTool provides secure and free online PDF editor, QR code generator, image tools and calculators." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="VexaTool" />
        <meta property="og:image" content="https://vexatool.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="All-in-One Free Online Tools – VexaTool" />
        <meta name="twitter:description" content="Free PDF editor, QR code generator, image tools and calculators." />
        <meta name="twitter:image" content="https://vexatool.com/og-image.png" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <QuickAccessBar />
        <main className="flex-1" role="main">
          <Hero />
          <TrustStrip />
          
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
