import { ReactNode, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdBanner, MobileAdBanner, DesktopAdBanner } from "@/components/AdBanner";
import { SidebarAd, InArticleAd } from "@/components/SidebarAd";
import { LucideIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { getCategoryForTool } from "@/components/Breadcrumb";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  colorClass: string;
  children: ReactNode;
  category?: string;
}

export const ToolLayout = ({
  title,
  description,
  icon: Icon,
  colorClass,
  children,
  category = "UtilitiesApplication",
  }: ToolLayoutProps) => {
  const canonicalUrl = useCanonicalUrl();
  const [showAds, setShowAds] = useState(false);

  useEffect(() => {
    const enable = () => setShowAds(true);
    const timeoutId = window.setTimeout(enable, 1200);

    if ('requestIdleCallback' in window) {
      window.clearTimeout(timeoutId);
      const idleId = window.requestIdleCallback(enable, { timeout: 2500 });
      return () => {
        if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      };
    }

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
      <StructuredData
        type="WebApplication"
        data={{
          name: title,
          description: description,
          url: canonicalUrl,
          applicationCategory: category,
          operatingSystem: "All",
          offers: {
            price: "0",
            priceCurrency: "USD"
          }
        }}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Top banner ad - deferred */}
          {showAds && (
            <div className="bg-muted/30 py-2">
              <div className="container mx-auto px-4">
                {/* Desktop: leaderboard */}
                <DesktopAdBanner slot="1111111111" className="max-w-4xl mx-auto" />
                {/* Mobile: smaller banner */}
                <MobileAdBanner slot="1111111112" />
              </div>
            </div>
          )}
          
          <section className="py-6 md:py-12 bg-background">
            <div className="container mx-auto px-4">
              {/* Breadcrumb Navigation */}
              <Breadcrumb className="mb-4" />
              
              <Link to="/">
                <Button variant="ghost" className="mb-4 md:mb-6 gap-2 text-muted-foreground hover:text-foreground text-sm md:text-base">
                  <ArrowLeft className="w-4 h-4" />
                  Back to all tools
                </Button>
              </Link>
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div
                  className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0",
                    colorClass
                  )}
                >
                  {Icon && <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />}
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                    {title}
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="py-4 md:py-8">
            <div className="container mx-auto px-4">
              <div className="flex gap-6 lg:gap-8">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {children}
                  
                  {/* In-content ad after tool - deferred */}
                  {showAds && (
                    <div className="mt-6 md:mt-8">
                      <InArticleAd slot="2222222222" />
                    </div>
                  )}
                </div>
                
                {/* Sidebar ad - desktop only (lg and up) */}
                {showAds && (
                  <div className="hidden lg:block w-[300px] flex-shrink-0">
                    <SidebarAd slot="3333333333" />
                  </div>
                )}
              </div>
            </div>
          </section>
          
          {/* Bottom banner ad - deferred */}
          {showAds && (
            <section className="py-4 md:py-6 bg-muted/20">
              <div className="container mx-auto px-4">
                <AdBanner 
                  network="google" 
                  slot="4444444444" 
                  mobileSlot="4444444445"
                  format="responsive" 
                  className="max-w-4xl mx-auto" 
                />
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};
