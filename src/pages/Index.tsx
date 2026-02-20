import { Header } from "@/components/Header";
import { QuickAccessBar } from "@/components/QuickAccessBar";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { Footer } from "@/components/Footer";
import { AdBanner, MobileAdBanner, DesktopAdBanner } from "@/components/AdBanner";
import { Helmet } from "react-helmet";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { lazy, Suspense, useEffect, useState } from "react";
import { HomepageContent } from "@/components/HomepageContent";

const AIToolsBanner = lazy(() =>
  import("@/components/AIToolsBanner").then((m) => ({ default: m.AIToolsBanner }))
);

const ToolsGrid = lazy(() =>
  import("@/components/ToolsGrid").then((m) => ({ default: m.ToolsGrid }))
);

const HomepageFAQ = lazy(() =>
  import("@/components/HomepageFAQ").then((m) => ({ default: m.HomepageFAQ }))
);

// Lazy load non-critical ads after initial render
const LazyAds = () => {
  const [showAds, setShowAds] = useState(false);
  
  useEffect(() => {
    // Defer ad loading until after LCP
    const timer = setTimeout(() => setShowAds(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  if (!showAds) return null;
  
  return (
    <>
      {/* Ad before tools grid - mobile optimized */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        <AdBanner 
          network="google" 
          slot="7777777777" 
          mobileSlot="7777777778"
          format="responsive" 
          className="max-w-2xl mx-auto" 
        />
      </div>
    </>
  );
};

const Index = () => {
  const canonicalUrl = useCanonicalUrl();
  const [showDeferredContent, setShowDeferredContent] = useState(false);
  
  useEffect(() => {
    // Defer non-critical content until after initial paint
    const timer = setTimeout(() => setShowDeferredContent(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Free PDF Tools India – Merge, Compress, Convert & Edit PDFs Online | MyPDFs</title>
        <meta name="description" content="India's best free PDF tools online. Merge PDF, compress PDF, convert PDF to Excel & Word, edit PDF without watermark, generate QR codes. 50+ secure tools, no signup required." />
        <meta name="keywords" content="free PDF tools India, PDF editor online free, merge PDF online, compress PDF free, PDF to Excel, PDF to Word converter, QR code generator online, best PDF tool website, convert PDF online free, secure PDF tools, PDF editor for students" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MyPDFs",
            "url": "https://mypdfs.in",
            "logo": "https://mypdfs.in/favicon.png",
            "description": "India's best free online PDF editor, converter, and document tools. 50+ tools including merge, split, compress, convert PDFs, image tools, AI utilities, QR code generator, and calculators.",
            "email": "mypdfs3003@gmail.com",
            "sameAs": [
              "https://x.com/Mypdfs5",
              "https://t.me/mypdfs5"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "mypdfs3003@gmail.com",
              "contactType": "customer support",
              "availableLanguage": ["English", "Hindi"]
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "MyPDFs",
            "url": "https://mypdfs.in",
            "description": "Free PDF tools India. Merge, compress, convert PDF to Excel & Word, edit PDF online, QR code generator. No signup required.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://mypdfs.in/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        {/* SoftwareApplication Schema for homepage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "MyPDFs - Free PDF Tools",
            "description": "50+ free online PDF tools — merge, compress, convert, edit PDFs. QR code generator, AI tools, calculators. No signup required.",
            "url": "https://mypdfs.in",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "2450",
              "bestRating": "5"
            },
            "provider": {
              "@type": "Organization",
              "name": "MyPDFs",
              "url": "https://mypdfs.in"
            }
          })}
        </script>
        <meta name="publisher" content="Mypdfs" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Free PDF Tools India – Merge, Compress, Convert & Edit PDFs Online | MyPDFs" />
        <meta property="og:description" content="India's best free PDF tools. Merge, compress, convert PDF to Excel & Word, edit PDF online. 50+ tools, no signup." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Mypdfs" />
        <meta property="og:image" content="https://storage.googleapis.com/gpt-engineer-file-uploads/H0EIl35BxQWLh4NdLmtGLNCeUyu1/social-images/social-1766655878266-1000262480.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Mypdfs5" />
        <meta name="twitter:creator" content="@Mypdfs5" />
        <meta name="twitter:title" content="Free PDF Tools India – Merge, Compress, Convert & Edit PDFs | MyPDFs" />
        <meta name="twitter:description" content="India's best free PDF tools. Merge, compress, convert PDF to Excel & Word, edit PDF online. 50+ secure tools, no signup." />
        <meta name="twitter:image" content="https://storage.googleapis.com/gpt-engineer-file-uploads/H0EIl35BxQWLh4NdLmtGLNCeUyu1/social-images/social-1766655878266-1000262480.jpg" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <QuickAccessBar />
        <main className="flex-1" role="main">
          <Hero />
          <TrustStrip />
          
          {showDeferredContent && (
            <>
              {/* Top ad - deferred */}
              <div className="bg-muted/30 py-2">
                <div className="container mx-auto px-4">
                  <DesktopAdBanner slot="5555555555" className="max-w-4xl mx-auto" />
                  <MobileAdBanner slot="5555555556" />
                </div>
              </div>
              
              <Suspense fallback={null}>
                <AIToolsBanner />
              </Suspense>
              
              <LazyAds />
            </>
          )}
          
          <Suspense
            fallback={
              <section 
                id="tools-grid-placeholder"
                className="py-12 md:py-20 bg-background" 
                aria-hidden="true"
              >
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
          
          {/* Rich Homepage Content for AdSense */}
          <HomepageContent />
          
          {/* Homepage FAQ Section */}
          {showDeferredContent && (
            <Suspense fallback={null}>
              <HomepageFAQ />
            </Suspense>
          )}
          
          {showDeferredContent && (
            <>
              {/* Ad after tools grid - responsive */}
              <div className="container mx-auto px-4 py-4 md:py-8">
                <AdBanner 
                  network="google" 
                  slot="8888888888" 
                  mobileSlot="8888888889"
                  format="responsive" 
                  className="max-w-4xl mx-auto" 
                />
              </div>
              
              {/* Bottom multiplex ad - desktop only for better mobile UX */}
              <div className="hidden md:block bg-muted/20 py-6">
                <div className="container mx-auto px-4">
                  <AdBanner network="google" slot="9999999999" format="auto" className="max-w-5xl mx-auto" />
                </div>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;