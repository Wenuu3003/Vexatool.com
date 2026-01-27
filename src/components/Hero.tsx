import { Shield, Zap, UserX, Gift, FileText, Image, Cpu, Calculator } from "lucide-react";

export const Hero = () => {
  return (
    <section className="py-16 md:py-28 bg-hero-gradient" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4">
        {/* Main Hero Content */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            id="hero-heading" 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            50+ Free Online Tools for{" "}
            <span className="text-primary">PDFs</span>,{" "}
            <span className="text-secondary">Images</span> & More
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Edit, compress, merge, convert PDFs. Resize images, generate QR codes, use AI tools and calculators. 
            All 100% free, no registration required—processed securely in your browser.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-card text-foreground rounded-full text-sm font-medium shadow-sm border border-border">
              <FileText className="w-4 h-4 text-primary" />
              PDF Tools
            </span>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-card text-foreground rounded-full text-sm font-medium shadow-sm border border-border">
              <Image className="w-4 h-4 text-secondary" />
              Image Tools
            </span>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-card text-foreground rounded-full text-sm font-medium shadow-sm border border-border">
              <Cpu className="w-4 h-4 text-primary" />
              AI Powered
            </span>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-card text-foreground rounded-full text-sm font-medium shadow-sm border border-border">
              <Calculator className="w-4 h-4 text-secondary" />
              Calculators
            </span>
          </div>
        </div>
        
        {/* Trust indicators - Card style */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Secure & Private</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm font-medium text-foreground">Instant Processing</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">No Signup Required</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm font-medium text-foreground">100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
