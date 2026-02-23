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
   
        import { Header } from "@/components/Header";
import { QuickAccessBar } from "@/components/QuickAccessBar";
import { TrustStrip } from "@/components/TrustStrip";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { Suspense, lazy } from "react";

const ToolGrid = lazy(() => import("@/components/ToolGrid"));
const HomepageFAQ = lazy(() => import("@/components/HomepageFAQ"));

const Index = () => {
  return (
    <>
      <Helmet>
        <title>All-in-One Free Online Tools | VexaTool</title>
        <meta
          name="description"
          content="Free online PDF editor, image tools, QR code generator and calculators. Fast, secure and mobile-friendly."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <QuickAccessBar />

        <main className="flex-1">

          {/* 🔥 MODERN HERO SECTION */}
          <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white text-center">
            <div className="max-w-6xl mx-auto px-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                All-in-One Free Online Tools
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-10">
                PDF Editor, Image Tools, QR Generator & Calculators — Fast,
                Secure & 100% Free.
              </p>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a
                  href="#tools"
                  className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
                >
                  Explore Tools
                </a>

                <a
                  href="#features"
                  className="border border-white px-8 py-3 rounded-xl hover:bg-white hover:text-indigo-700 transition"
                >
                  Learn More
                </a>
              </div>
            </div>
          </section>

          <TrustStrip />

          {/* 🔥 WHY CHOOSE US */}
          <section id="features" className="py-20 bg-white text-center">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">
                Why Choose VexaTool?
              </h2>

              <div className="grid md:grid-cols-4 gap-8">
                <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-xl transition">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm">
                    Instant browser-based processing.
                  </p>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-xl transition">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="font-semibold mb-2">Secure & Private</h3>
                  <p className="text-gray-600 text-sm">
                    Files auto-deleted after processing.
                  </p>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-xl transition">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="font-semibold mb-2">Mobile Friendly</h3>
                  <p className="text-gray-600 text-sm">
                    Works smoothly on all devices.
                  </p>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-xl transition">
                  <div className="text-4xl mb-4">💯</div>
                  <h3 className="font-semibold mb-2">100% Free</h3>
                  <p className="text-gray-600 text-sm">
                    No signup required. Unlimited access.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 🔥 TOOLS GRID */}
          <section id="tools" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                All Free Online Tools
              </h2>

              <Suspense fallback={<div className="text-center">Loading tools...</div>}>
                <ToolGrid />
              </Suspense>
            </div>
          </section>

          {/* 🔥 FINAL CTA */}
          <section className="py-20 bg-indigo-600 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="mb-8 opacity-90">
              Use powerful tools instantly — no login required.
            </p>

            <a
              href="#tools"
              className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Start Now
            </a>
          </section>

          {/* 🔥 FAQ */}
          <Suspense fallback={null}>
            <HomepageFAQ />
          </Suspense>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;import { Header } from "@/components/Header";
import { QuickAccessBar } from "@/components/QuickAccessBar";
import { TrustStrip } from "@/components/TrustStrip";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { Suspense, lazy } from "react";

const ToolGrid = lazy(() => import("@/components/ToolGrid"));
const HomepageFAQ = lazy(() => import("@/components/HomepageFAQ"));

const Index = () => {
  return (
    <>
      <Helmet>
        <title>All-in-One Free Online Tools | VexaTool</title>
        <meta
          name="description"
          content="Free online PDF editor, image tools, QR code generator and calculators. Fast, secure and mobile-friendly."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <QuickAccessBar />

        <main className="flex-1">

          {/* 🔥 MODERN HERO SECTION */}
          <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white text-center">
            <div className="max-w-6xl mx-auto px-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                All-in-One Free Online Tools
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-10">
                PDF Editor, Image Tools, QR Generator & Calculators — Fast,
                Secure & 100% Free.
              </p>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a
                  href="#tools"
                  className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
                >
                  Explore Tools
                </a>

                <a
                  href="#features"
                  className="border border-white px-8 py-3 rounded-xl hover:bg-white hover:text-indigo-700 transition"
                >
                  Learn More
                </a>
              </div>
            </div>
          </section>

          <TrustStrip />

          {/* 🔥 WHY CHOOSE US */}
          <section id="features" className="py-20 bg-white text-center">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">
                Why Choose VexaTool?
              </h2>

              <div className="grid md:grid-cols-4 gap-8">
                <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-xl transition">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm">
                    Instant browser-based processing.
                  </p>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-xl transition">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="font-semibold mb-2">Secure & Private</h3>
                  <p className="text-gray-600 text-sm">
                    Files auto-deleted after processing.
                  </p>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-xl transition">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="font-semibold mb-2">Mobile Friendly</h3>
                  <p className="text-gray-600 text-sm">
                    Works smoothly on all devices.
                  </p>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-xl transition">
                  <div className="text-4xl mb-4">💯</div>
                  <h3 className="font-semibold mb-2">100% Free</h3>
                  <p className="text-gray-600 text-sm">
                    No signup required. Unlimited access.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 🔥 TOOLS GRID */}
          <section id="tools" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                All Free Online Tools
              </h2>

              <Suspense fallback={<div className="text-center">Loading tools...</div>}>
                <ToolGrid />
              </Suspense>
            </div>
          </section>

          {/* 🔥 FINAL CTA */}
          <section className="py-20 bg-indigo-600 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="mb-8 opacity-90">
              Use powerful tools instantly — no login required.
            </p>

            <a
              href="#tools"
              className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Start Now
            </a>
          </section>

          {/* 🔥 FAQ */}
          <Suspense fallback={null}>
            <HomepageFAQ />
          </Suspense>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
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
