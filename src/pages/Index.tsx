import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AIToolsBanner } from "@/components/AIToolsBanner";
import { ToolsGrid } from "@/components/ToolsGrid";
import { Footer } from "@/components/Footer";
import { AdBanner, MobileAdBanner, DesktopAdBanner } from "@/components/AdBanner";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Mypdfs - Free Online PDF Tools, QR Code Generator & Scanner | 30+ Tools</title>
        <meta name="description" content="Free online PDF editor with 30+ tools. Merge, split, compress, convert PDFs instantly. QR code generator with custom logos. AI chat assistant. Calculator, currency converter, SEO analyzer. 100% free, no registration." />
        <meta name="keywords" content="PDF tools, merge PDF, split PDF, compress PDF, PDF converter, PDF to Word, Word to PDF, PDF to Excel, JPG to PDF, PNG to PDF, QR code generator, QR code scanner, currency converter, SEO tool, free online tools, AI chat, file compressor" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="Mypdfs" />
        <meta name="publisher" content="Mypdfs" />
        <link rel="canonical" href="https://www.mypdfs.com/" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Mypdfs - Free Online PDF Tools & Utilities | 30+ Tools" />
        <meta property="og:description" content="Free online PDF editor with 30+ tools. Merge, split, compress PDFs. QR code generator & scanner. AI chat. Calculator, SEO analyzer. No registration required." />
        <meta property="og:url" content="https://www.mypdfs.com/" />
        <meta property="og:site_name" content="Mypdfs" />
        <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Mypdfs5" />
        <meta name="twitter:creator" content="@Mypdfs5" />
        <meta name="twitter:title" content="Mypdfs - Free Online PDF Tools & Utilities" />
        <meta name="twitter:description" content="Free online PDF editor with 30+ tools. QR code generator & scanner, AI chat, currency converter, SEO analyzer. 100% free." />
        <meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1" role="main">
          {/* Top leaderboard ad - responsive */}
          <div className="bg-muted/30 py-2">
            <div className="container mx-auto px-4">
              <DesktopAdBanner slot="5555555555" className="max-w-4xl mx-auto" />
              <MobileAdBanner slot="5555555556" />
            </div>
          </div>
          
          <Hero />
          
          {/* Ad after hero - responsive */}
          <div className="container mx-auto px-4 py-3 md:py-4">
            <AdBanner 
              network="google" 
              slot="6666666666" 
              mobileSlot="6666666667"
              format="responsive" 
              className="max-w-4xl mx-auto" 
            />
          </div>
          
          <AIToolsBanner />
          
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
          
          <ToolsGrid />
          
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
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;