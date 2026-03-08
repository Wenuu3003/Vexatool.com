import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Zap, Globe } from "lucide-react";

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "PDF Tools": [
      { name: "PDF Editor", path: "/edit-pdf" },
      { name: "Merge PDF", path: "/merge-pdf" },
      { name: "Split PDF", path: "/split-pdf" },
      { name: "Compress PDF", path: "/compress-pdf" },
      { name: "PDF to Word", path: "/pdf-to-word" },
      { name: "Rotate PDF", path: "/rotate-pdf" },
    ],
    "Image & QR Tools": [
      { name: "Image Resizer", path: "/image-resizer" },
      { name: "Image Compressor", path: "/compress-image" },
      { name: "Background Remover", path: "/background-remover" },
      { name: "Image Converter", path: "/image-format-converter" },
      { name: "QR Code Generator", path: "/qr-code-generator" },
      { name: "QR Code Scanner", path: "/qr-code-scanner" },
    ],
    Calculators: [
      { name: "Love Calculator", path: "/love-calculator" },
      { name: "BMI Calculator", path: "/bmi-calculator" },
      { name: "EMI Calculator", path: "/emi-calculator" },
      { name: "Percentage Calculator", path: "/percentage-calculator" },
      { name: "Word Counter", path: "/word-counter" },
    ],
    Company: [
      { name: "About Us", path: "/about-us" },
      { name: "Contact Us", path: "/contact" },
      { name: "Blog", path: "/blog" },
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Terms & Conditions", path: "/terms-and-conditions" },
      { name: "Disclaimer", path: "/disclaimer" },
    ],
  };

  return (
    <footer ref={ref} className="bg-card border-t border-border pt-12 sm:pt-16 pb-6 sm:pb-8" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-10 sm:mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4" aria-label="VexaTool Home">
              <img src="/favicon.png" alt="VexaTool logo" className="w-9 h-9 rounded-lg shadow-sm" width={36} height={36} />
              <span className="text-lg font-bold text-foreground">
                Vexa<span className="text-primary">Tool</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-xs">
              Free online PDF tools, image converters, calculators, and QR code tools. Secure browser-based processing.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`${category} links`}>
              <h4 className="font-semibold mb-3 text-foreground text-sm">{category}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-xs sm:text-sm transition-colors text-muted-foreground hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          {[
            { icon: ShieldCheck, label: "Verified Safe", color: "text-green-500" },
            { icon: Lock, label: "256-bit SSL", color: "text-primary" },
            { icon: Zap, label: "100% Free", color: "text-amber-500" },
            { icon: Globe, label: "Made in India", color: "text-primary" },
          ].map((badge) => (
            <span key={badge.label} className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-muted/50 border border-border/60">
              <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
              {badge.label}
            </span>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground">© {currentYear} VexaTool. All rights reserved.</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Your files never leave your browser. 100% secure & private.
              </p>
            </div>
            <nav className="flex items-center gap-4 sm:gap-5 flex-wrap justify-center" aria-label="Legal links">
              {[
                { name: "Privacy", path: "/privacy-policy" },
                { name: "Terms", path: "/terms-and-conditions" },
                { name: "Disclaimer", path: "/disclaimer" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <Link key={link.name} to={link.path} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
});
Footer.displayName = "Footer";
