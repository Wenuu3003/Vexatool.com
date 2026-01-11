import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { FileText, Mail, Send, Facebook, Twitter, ShieldCheck, Lock, Zap, Globe } from "lucide-react";

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Telegram", icon: Send, url: "https://t.me/mypdfs5" },
    { name: "Facebook", icon: Facebook, url: "https://www.facebook.com/profile.php?id=61585311704800" },
    { name: "X", icon: Twitter, url: "https://x.com/Mypdfs5" },
    { name: "Email", icon: Mail, url: "mailto:welovepdfs3003@gmail.com" },
  ];

  const footerLinks = {
    "PDF Tools": [
      { name: "Merge PDF", path: "/merge-pdf" },
      { name: "Split PDF", path: "/split-pdf" },
      { name: "Compress PDF", path: "/compress-pdf" },
      { name: "PDF to Word", path: "/pdf-to-word" },
      { name: "PDF to PowerPoint", path: "/pdf-to-powerpoint" },
      { name: "PDF to Excel", path: "/pdf-to-excel" },
    ],
    "Convert to PDF": [
      { name: "Word to PDF", path: "/word-to-pdf" },
      { name: "PPT to PDF", path: "/ppt-to-pdf" },
      { name: "Excel to PDF", path: "/excel-to-pdf" },
      { name: "JPG to PDF", path: "/jpg-to-pdf" },
      { name: "HTML to PDF", path: "/html-to-pdf" },
    ],
    Company: [
      { name: "About Us", path: "/about-us" },
      { name: "Contact Us", path: "/contact" },
      { name: "Blog", path: "/blog" },
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Terms & Conditions", path: "/terms-and-conditions" },
    ],
  };

  return (
    <footer ref={ref} className="bg-card border-t border-border pt-16 pb-8" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="Mypdfs Home">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-foreground">
                <span className="text-primary">My</span>pdfs
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free online PDF tools, image converters, AI tools, calculators, and more. Edit, compress, merge, and
              convert your documents securely in your browser.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`${category} links`}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`Go to ${link.name}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Social Links */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <h4 className="font-semibold text-foreground">Connect With Us</h4>
          <nav className="flex items-center gap-4" aria-label="Social media links">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label={`Follow us on ${social.name}`}
                title={`Follow us on ${social.name}`}
              >
                <social.icon className="w-5 h-5" aria-hidden="true" />
              </a>
            ))}
          </nav>
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <a
              href="https://www.scamadviser.com/check-website/mypdfs.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full bg-muted/50"
              aria-label="View our ScamAdviser verification"
            >
              <ShieldCheck className="w-4 h-4 text-green-500" aria-hidden="true" />
              Verified Safe
            </a>
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50">
              <Lock className="w-4 h-4 text-primary" aria-hidden="true" />
              256-bit SSL
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50">
              <Zap className="w-4 h-4 text-yellow-500" aria-hidden="true" />
              100% Free
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50">
              <Globe className="w-4 h-4 text-blue-500" aria-hidden="true" />
              Made in India
            </span>
          </div>
        </div>

        {/* Bottom - Copyright, Privacy, Terms */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">© {currentYear} Mypdfs. All rights reserved.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your files never leave your browser. 100% secure & private processing.
              </p>
            </div>
            <nav className="flex items-center gap-6" aria-label="Legal links">
              <a href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a
                href="/terms-and-conditions"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms & Conditions
              </a>
              <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
