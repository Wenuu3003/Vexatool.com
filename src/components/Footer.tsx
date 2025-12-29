import { forwardRef } from "react";
import { FileText, Mail, Send, Facebook, Twitter, ShieldCheck } from "lucide-react";

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Telegram", icon: Send, url: "https://t.me/mypdfs5" },
    { name: "Facebook", icon: Facebook, url: "https://www.facebook.com/share/1APrgMPiYZ/" },
    { name: "X", icon: Twitter, url: "https://x.com/Mypdfs5" },
    { name: "Email", icon: Mail, url: "mailto:mypdfs3003@gmail.com" },
  ];

  const footerLinks = {
    "PDF Tools": [
      "Merge PDF",
      "Split PDF",
      "Compress PDF",
      "PDF to Word",
      "PDF to PowerPoint",
      "PDF to Excel",
      "AI Text generator",
      "you tube seo generator",
      "Hastags Generator",
      "Age caluculator",
      "BMI Caluculator",
    ],
    "Convert to PDF": [
      "Word to PDF",
      "PowerPoint to PDF",
      "Excel to PDF",
      "JPG to PDF",
      "HTML to PDF",
      "Image Resizer",
      "EMI Caluculator",
      "GST Caluculator",
      "QR Code generator",
      "QR Code Scanner",
      "Image convertor",
    ],
    Company: ["About Us", "Pricing", "Blog", "Contact", "Privacy Policy", "Terms & Conditions"],
  };

  return (
    <footer ref={ref} className="bg-card border-t border-border pt-16 pb-8" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2 mb-4" aria-label="Mypdfs Home">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-foreground">
                <span className="text-primary">My</span>pdfs
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mypdfs is an online service to work with PDF files completely free and easy to use.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`${category} links`}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`Go to ${link}`}
                    >
                      {link}
                    </a>
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
          {/* ScamAdviser Trust Badge */}
          <a
            href="https://www.scamadviser.com/check-website/mypdfs.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-2"
            aria-label="View our ScamAdviser verification"
          >
            <ShieldCheck className="w-4 h-4 text-green-500" aria-hidden="true" />
            Verified on ScamAdviser
          </a>
        </div>

        {/* Bottom - Copyright, Privacy, Terms */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© {currentYear} Mypdfs. All rights reserved.</p>
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
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
