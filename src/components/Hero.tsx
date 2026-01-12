import { FileText, Image, Cpu, Calculator, Shield, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <section className="py-16 md:py-24 bg-background" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4 text-center">
        <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
          50+ Free Online Tools for PDFs, Images & More
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Merge, split, compress, convert PDFs. Resize images, generate QR codes, use AI tools, and calculators. 
          All 100% free, no registration required, processed securely in your browser.
        </p>
        
        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <FileText className="w-4 h-4" />
            PDF Tools
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
            <Image className="w-4 h-4" />
            Image Tools
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
            <Cpu className="w-4 h-4" />
            AI Powered
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
            <Calculator className="w-4 h-4" />
            Calculators
          </span>
        </div>
        
        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <span className="inline-flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Secure & Private
          </span>
          <span className="inline-flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Instant Processing
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            No Signup Required
          </span>
        </div>
      </div>
    </section>
  );
};
