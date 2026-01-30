import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, Facebook, Twitter, ShieldCheck, Lock, Zap, Globe } from "lucide-react";
export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [{
    name: "Telegram",
    icon: Send,
    url: "https://t.me/mypdfs5"
  }, {
    name: "Facebook",
    icon: Facebook,
    url: "https://www.facebook.com/share/1APrgMPiYZ/"
  }, {
    name: "X",
    icon: Twitter,
    url: "https://x.com/Mypdfs5"
  }, {
    name: "Email",
    icon: Mail,
    url: "mailto:mypdfs3003@gmail.com"
  }];
  const footerLinks = {
    "PDF Tools": [{
      name: "Merge PDF",
      path: "/merge-pdf"
    }, {
      name: "Split PDF",
      path: "/split-pdf"
    }, {
      name: "Compress PDF",
      path: "/compress-pdf"
    }, {
      name: "PDF to Word",
      path: "/pdf-to-word"
    }, {
      name: "Rotate PDF",
      path: "/rotate-pdf"
    }, {
      name: "Watermark PDF",
      path: "/watermark-pdf"
    }],
    "Convert to PDF": [{
      name: "Word to PDF",
      path: "/word-to-pdf"
    }, {
      name: "PPT to PDF",
      path: "/ppt-to-pdf"
    }, {
      name: "Excel to PDF",
      path: "/excel-to-pdf"
    }, {
      name: "JPG to PDF",
      path: "/jpg-to-pdf"
    }, {
      name: "PNG to PDF",
      path: "/png-to-pdf"
    }, {
      name: "Image to PDF",
      path: "/image-to-pdf"
    }],
    "AI & Image Tools": [{
      name: "AI Chat",
      path: "/ai-chat"
    }, {
      name: "AI Grammar Check",
      path: "/ai-grammar-tool"
    }, {
      name: "Background Remover",
      path: "/background-remover"
    }, {
      name: "Compress Image",
      path: "/compress-image"
    }, {
      name: "QR Code Generator",
      path: "/qr-code-generator"
    }, {
      name: "Image Resizer",
      path: "/image-resizer"
    }],
    Company: [{
      name: "About Us",
      path: "/about-us"
    }, {
      name: "Contact Us",
      path: "/contact"
    }, {
      name: "Blog",
      path: "/blog"
    }, {
      name: "Privacy Policy",
      path: "/privacy-policy"
    }, {
      name: "Terms & Conditions",
      path: "/terms-and-conditions"
    }]
  };
  return <footer ref={ref} className="bg-card border-t border-border pt-16 pb-8" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-5" aria-label="Mypdfs Home">
              <img src="/favicon.png" alt="Mypdfs logo" className="w-10 h-10 rounded-xl shadow-sm" width={40} height={40} />
              <span className="text-xl font-bold text-foreground">
                My<span className="text-primary">pdfs</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-primary">
              Free online PDF tools, image converters, AI tools, calculators, and more. Edit, compress, merge, and convert your documents securely in your browser.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => <nav key={category} aria-label={`${category} links`}>
              <h4 className="font-semibold mb-4 text-tool-sign">{category}</h4>
              <ul className="space-y-2">
                {links.map(link => <li key={link.name}>
                    <Link to={link.path} className="text-sm transition-colors text-primary" aria-label={`Go to ${link.name}`}>
                      {link.name}
                    </Link>
                  </li>)}
              </ul>
            </nav>)}
        </div>

        {/* Social Links */}
        <div className="flex flex-col items-center gap-5 mb-10">
          <h4 className="font-semibold text-tool-edit">Connect With Us</h4>
          <nav className="flex items-center gap-3" aria-label="Social media links">
            {socialLinks.map(social => <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200" aria-label={`Follow us on ${social.name}`} title={`Follow us on ${social.name}`}>
                <social.icon className="w-5 h-5" aria-hidden="true" />
              </a>)}
          </nav>
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <a href="https://www.scamadviser.com/check-website/mypdfs.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-xl bg-muted/50 border border-border" aria-label="View our ScamAdviser verification">
              <ShieldCheck className="w-4 h-4 text-green-500" aria-hidden="true" />
              Verified Safe
            </a>
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-xl bg-muted/50 border border-border">
              <Lock className="w-4 h-4 text-primary" aria-hidden="true" />
              256-bit SSL
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-xl bg-muted/50 border border-border">
              <Zap className="w-4 h-4 text-amber-500" aria-hidden="true" />
              100% Free
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 rounded-xl bg-muted/50 border border-border">
              <Globe className="w-4 h-4 text-primary" aria-hidden="true" />
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
              <a href="/terms-and-conditions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </a>
              <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>;
});
Footer.displayName = "Footer";