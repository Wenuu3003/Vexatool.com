import { Shield, Zap, UserX, Gift, FileText, Image, Calculator, QrCode } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="py-16 md:py-28 bg-hero-gradient" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
            All-in-One Free Online Tools –{" "}
            <span className="text-primary">PDF</span>, QR & Calculator Tools
          </h1>
          
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed text-muted-foreground">
            VexaTool provides secure and free online PDF editor, QR code generator, image tools and calculators. 
            Fast, easy and mobile-friendly tools for students, professionals and everyone.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Link to="/pdf-tools" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card rounded-full text-sm font-medium shadow-sm border border-border text-foreground hover:border-primary transition-colors">
              <FileText className="w-4 h-4 text-primary" />
              PDF Tools
            </Link>
            <Link to="/image-tools" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card rounded-full text-sm font-medium shadow-sm border border-border text-foreground hover:border-primary transition-colors">
              <Image className="w-4 h-4 text-primary" />
              Image Tools
            </Link>
            <Link to="/qr-tools" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card rounded-full text-sm font-medium shadow-sm border border-border text-foreground hover:border-primary transition-colors">
              <QrCode className="w-4 h-4 text-primary" />
              QR Tools
            </Link>
            <Link to="/calculator-tools" className="inline-flex items-center gap-2 px-5 py-2.5 bg-card rounded-full text-sm font-medium shadow-sm border border-border text-foreground hover:border-primary transition-colors">
              <Calculator className="w-4 h-4 text-primary" />
              Calculators
            </Link>
          </div>
        </div>
        
        {/* Trust indicators */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-6 shadow-md border border-border bg-card/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Secure & Private</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
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
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
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
