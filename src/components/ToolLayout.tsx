import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { AdBanner } from "@/components/AdBanner";
import { SidebarAd } from "@/components/SidebarAd";
import { LucideIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  const location = useLocation();
  const baseUrl = "https://mypdfs.lovable.app";
  const currentUrl = `${baseUrl}${location.pathname}`;

  return (
    <>
      <StructuredData
        type="WebApplication"
        data={{
          name: title,
          description: description,
          url: currentUrl,
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
          {/* Top banner ad */}
          <div className="bg-muted/30 py-2">
            <div className="container mx-auto px-4">
              <AdBanner network="google" slot="1111111111" format="horizontal" className="max-w-4xl mx-auto" />
            </div>
          </div>
          
          <section className="py-8 md:py-12 bg-background">
            <div className="container mx-auto px-4">
              <Link to="/">
                <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                  Back to all tools
                </Button>
              </Link>
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center",
                    colorClass
                  )}
                >
                  {Icon && <Icon className="w-8 h-8 text-primary-foreground" />}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {title}
                  </h1>
                  <p className="text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <div className="flex gap-8">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {children}
                  
                  {/* In-content ad after tool */}
                  <div className="mt-8">
                    <AdBanner network="google" slot="2222222222" format="rectangle" className="max-w-lg mx-auto" />
                  </div>
                </div>
                
                {/* Sidebar ad - desktop only */}
                <div className="hidden xl:block w-[300px] flex-shrink-0">
                  <SidebarAd slot="3333333333" />
                </div>
              </div>
            </div>
          </section>
          
          {/* Bottom banner ad */}
          <section className="py-6 bg-muted/20">
            <div className="container mx-auto px-4">
              <AdBanner network="google" slot="4444444444" format="horizontal" className="max-w-4xl mx-auto" />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};
