import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AIToolsBanner } from "@/components/AIToolsBanner";
import { ToolsGrid } from "@/components/ToolsGrid";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
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
          <Hero />
          
          {/* Ad after hero */}
          <div className="container mx-auto px-4 py-4">
            <AdBanner network="google" slot="1234567890" format="horizontal" className="max-w-4xl mx-auto" />
          </div>
          
          <AIToolsBanner />
          <ToolsGrid />
          
          {/* Ad after tools grid */}
          <div className="container mx-auto px-4 py-8">
            <AdBanner network="google" slot="1234567891" format="horizontal" className="max-w-4xl mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;