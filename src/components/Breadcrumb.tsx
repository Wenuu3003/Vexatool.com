import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route to category mapping
const categoryMap: Record<string, string> = {
  // PDF Tools
  "merge-pdf": "PDF Tools",
  "split-pdf": "PDF Tools",
  "compress-pdf": "PDF Tools",
  "pdf-to-word": "PDF Tools",
  "edit-pdf": "PDF Tools",
  "sign-pdf": "PDF Tools",
  "watermark-pdf": "PDF Tools",
  "rotate-pdf": "PDF Tools",
  "unlock-pdf": "PDF Tools",
  "protect-pdf": "PDF Tools",
  "organize-pdf": "PDF Tools",
  "repair-pdf": "PDF Tools",
  "pdf-to-image": "PDF Tools",
  "pdf-to-jpg": "PDF Tools",
  "pdf-to-png": "PDF Tools",
  "pdf-to-html": "PDF Tools",
  "pdf-to-powerpoint": "PDF Tools",
  "pdf-to-excel": "PDF Tools",
  // Convert to PDF
  "image-to-pdf": "Convert to PDF",
  "jpg-to-pdf": "Convert to PDF",
  "png-to-pdf": "Convert to PDF",
  "word-to-pdf": "Convert to PDF",
  "html-to-pdf": "Convert to PDF",
  "ppt-to-pdf": "Convert to PDF",
  "excel-to-pdf": "Convert to PDF",
  "google-drive-to-pdf": "Convert to PDF",
  // Image Tools
  "compress-image": "Image Tools",
  "image-resizer": "Image Tools",
  "image-format-converter": "Image Tools",
  "background-remover": "Image Tools",
  "file-compressor": "Image Tools",
  // AI Tools
  "ai-chat": "AI Tools",
  "ai-search": "AI Tools",
  "ai-text-generator": "AI Tools",
  "ai-grammar-tool": "AI Tools",
  "ai-resume-builder": "AI Tools",
  "hashtag-generator": "AI Tools",
  "youtube-generator": "AI Tools",
  "whatsapp-analyzer": "AI Tools",
  "word-counter": "AI Tools",
  // Calculator Tools
  "calculator": "Calculator Tools",
  "age-calculator": "Calculator Tools",
  "bmi-calculator": "Calculator Tools",
  "emi-calculator": "Calculator Tools",
  "gst-calculator": "Calculator Tools",
  "unit-converter": "Calculator Tools",
  "currency-converter": "Calculator Tools",
  // Utility Tools
  "qr-code-scanner": "QR Tools",
  "qr-code-generator": "QR Tools",
  "seo-tool": "Utility Tools",
  "pincode-generator": "Utility Tools",
};

// Convert path to readable name
const pathToName = (path: string): string => {
  return path
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
  const location = useLocation();
  
  // Generate breadcrumb items from current path if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const result: BreadcrumbItem[] = [];
    
    if (pathParts.length === 0) return result;
    
    // Check if this is a tool page and add category
    const toolPath = pathParts[0];
    const category = categoryMap[toolPath];
    
    if (category) {
      result.push({
        name: category,
        path: `/#${category.toLowerCase().replace(/\s+/g, "-")}`
      });
    }
    
    // Add current page
    let currentPath = "";
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      result.push({
        name: pathToName(part),
        path: currentPath
      });
    });
    
    return result;
  })();

  if (breadcrumbItems.length === 0) return null;

  // Generate JSON-LD for breadcrumbs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://mypdfs.in"
      },
      ...breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": `https://mypdfs.in${item.path}`
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center text-sm text-muted-foreground ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1">
          <li className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center hover:text-primary transition-colors"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </Link>
          </li>
          {breadcrumbItems.map((item, index) => (
            <li key={item.path} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" aria-hidden="true" />
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  to={item.path}
                  className="hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};
