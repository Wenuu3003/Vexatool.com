import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, Lock, Zap, Globe } from "lucide-react";

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
    "Calculators": [
      { name: "Love Calculator", path: "/love-calculator" },
      { name: "BMI Calculator", path: "/bmi-calculator" },
      { name: "EMI Calculator", path: "/emi-calculator" },
      { name: "Age Calculator", path: "/age-calculator" },
      { name: "Percentage Calculator", path: "/percentage-calculator" },
      { name: "Word Counter", path: "/word-counter" },
    ],
    "Company": [
      { name: "About Us", path: "/about-us" },
      { name: "Contact Us", path: "/contact" },
      { name: "Blog", path: "/blog" },
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Terms & Conditions", path: "/terms-and-conditions" },
      { name: "Disclaimer", path: "/disclaimer" },
    ],
  };

  return (
    <footer ref={ref} className="bg-card border-t border-border pt-16 pb-8" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-5" aria-label="VexaTool Home">
              <img src="/favicon.png" alt="VexaTool logo" className="w-10 h-10 rounded-xl shadow-sm" width={40} height={40} />
              <span className="text-xl font-bold text-foreground">
                Vexa<span className="text-primary">Tool</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Free online PDF tools, image converters, calculators, and QR code tools. Edit, compress, merge, and convert your documents securely in your browser.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`${category} links`}>
              <h4 className="font-semibold mb-4 text-foreground">{category}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-sm transition-colors text-muted-foreground hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-col items-center gap-5 mb-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-xl bg-muted/50 border border-border">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Verified Safe
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-xl bg-muted/50 border border-border">
              <Lock className="w-4 h-4 text-primary" />
              256-bit SSL
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-xl bg-muted/50 border border-border">
              <Zap className="w-4 h-4 text-amber-500" />
              100% Free
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-xl bg-muted/50 border border-border">
              <Globe className="w-4 h-4 text-primary" />
              Made in India
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">© {currentYear} VexaTool. All rights reserved.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your files never leave your browser. 100% secure & private processing.
              </p>
            </div>
            <nav className="flex items-center gap-6" aria-label="Legal links">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/disclaimer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Disclaimer
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
});
Footer.displayName = "Footer";
