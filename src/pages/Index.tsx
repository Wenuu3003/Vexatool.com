import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AIToolsBanner } from "@/components/AIToolsBanner";
import { ToolsGrid } from "@/components/ToolsGrid";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { StructuredData } from "@/components/StructuredData";

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Mypdfs - Free Online PDF Tools",
    "description": "Free online PDF tools to merge, split, compress, convert, edit PDFs. Also includes QR code tools, currency converter, SEO analyzer, calculator and more.",
    "url": "https://mypdfs.lovable.app",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Merge PDF",
      "Split PDF", 
      "Compress PDF",
      "PDF to Word",
      "Word to PDF",
      "PDF to Excel",
      "Excel to PDF",
      "PDF to Image",
      "Image to PDF",
      "JPG to PDF",
      "PNG to PDF",
      "PDF to JPG",
      "PDF to PNG",
      "PDF to HTML",
      "QR Code Generator",
      "QR Code Scanner",
      "Currency Converter",
      "SEO Analyzer",
      "Tags Generator",
      "Calculator",
      "File Compressor"
    ]
  };

  return (
    <>
      <Helmet>
        <title>Mypdfs - Free Online PDF Tools, QR Code Generator, Currency Converter & More</title>
        <meta name="description" content="Free online tools to merge, split, compress, convert PDF files. QR code generator & scanner, currency converter, SEO analyzer, calculator. 100% free, no registration required." />
        <meta name="keywords" content="PDF tools, merge PDF, split PDF, compress PDF, PDF converter, PDF to Word, Word to PDF, PDF to Excel, JPG to PDF, PNG to PDF, QR code generator, QR scanner, currency converter, SEO tool, free online tools" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Mypdfs" />
        <link rel="canonical" href="https://mypdfs.lovable.app/" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Mypdfs - Free Online PDF Tools & Utilities" />
        <meta property="og:description" content="Free online tools for PDF editing, QR codes, currency conversion, SEO analysis and more. No registration required." />
        <meta property="og:url" content="https://mypdfs.lovable.app/" />
        <meta property="og:site_name" content="Mypdfs" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mypdfs - Free Online PDF Tools & Utilities" />
        <meta name="twitter:description" content="Free online tools for PDF editing, QR codes, currency conversion, SEO analysis and more." />
      </Helmet>
      
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Hero />
          <AIToolsBanner />
          <ToolsGrid />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
