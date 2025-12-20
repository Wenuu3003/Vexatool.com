import { forwardRef } from "react";
import { FileText } from "lucide-react";

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "PDF Tools": [
      "Merge PDF",
      "Split PDF",
      "Compress PDF",
      "PDF to Word",
      "PDF to PowerPoint",
      "PDF to Excel",
    ],
    "Convert to PDF": [
      "Word to PDF",
      "PowerPoint to PDF",
      "Excel to PDF",
      "JPG to PDF",
      "HTML to PDF",
    ],
    Company: [
      "About Us",
      "Pricing",
      "Blog",
      "Contact",
      "Privacy Policy",
      "Terms & Conditions",
    ],
  };

  return (
    <footer ref={ref} className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                <span className="text-primary">We</span>lovePDF
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed">
              WelovePDF is an online service to work with PDF files completely free and easy to use.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} WelovePDF. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
