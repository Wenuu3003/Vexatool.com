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
const categoryMap: Record<string, { name: string; path: string }> = {
  // PDF Tools
  "merge-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "split-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "compress-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "pdf-to-word": { name: "PDF Tools", path: "/pdf-tools" },
  "edit-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "sign-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "watermark-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "rotate-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "unlock-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "protect-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "organize-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "repair-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "pdf-to-image": { name: "PDF Tools", path: "/pdf-tools" },
  "pdf-to-jpg": { name: "PDF Tools", path: "/pdf-tools" },
  "pdf-to-png": { name: "PDF Tools", path: "/pdf-tools" },
  "pdf-to-html": { name: "PDF Tools", path: "/pdf-tools" },
  "pdf-to-powerpoint": { name: "PDF Tools", path: "/pdf-tools" },
  "pdf-to-excel": { name: "PDF Tools", path: "/pdf-tools" },
  // Convert to PDF
  "image-to-pdf": { name: "Image Tools", path: "/image-tools" },
  "jpg-to-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "png-to-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "word-to-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "html-to-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "ppt-to-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "excel-to-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "google-drive-to-pdf": { name: "PDF Tools", path: "/pdf-tools" },
  "word-to-excel": { name: "PDF Tools", path: "/pdf-tools" },
  "excel-to-word": { name: "PDF Tools", path: "/pdf-tools" },
  // Image Tools
  "compress-image": { name: "Image Tools", path: "/image-tools" },
  "image-resizer": { name: "Image Tools", path: "/image-tools" },
  "image-format-converter": { name: "Image Tools", path: "/image-tools" },
  "background-remover": { name: "Image Tools", path: "/image-tools" },
  "file-compressor": { name: "Image Tools", path: "/image-tools" },
  "whatsapp-dp-resize": { name: "Image Tools", path: "/image-tools" },
  "aadhaar-photo-resize": { name: "Image Tools", path: "/image-tools" },
  "govt-job-photo-resize": { name: "Image Tools", path: "/image-tools" },
  "passport-photo-resize": { name: "Image Tools", path: "/image-tools" },
  // Utility Tools
  "word-counter": { name: "Utility Tools", path: "/utility-tools" },
  "pincode-generator": { name: "Utility Tools", path: "/utility-tools" },
  "unit-converter": { name: "Utility Tools", path: "/utility-tools" },
  // Calculator Tools
  "calculator": { name: "Calculator Tools", path: "/calculator-tools" },
  "love-calculator": { name: "Calculator Tools", path: "/calculator-tools" },
  "bmi-calculator": { name: "Calculator Tools", path: "/calculator-tools" },
  "emi-calculator": { name: "Calculator Tools", path: "/calculator-tools" },
  "gst-calculator": { name: "Calculator Tools", path: "/calculator-tools" },
  "percentage-calculator": { name: "Calculator Tools", path: "/calculator-tools" },
  "currency-converter": { name: "Calculator Tools", path: "/calculator-tools" },
  "age-calculator": { name: "Calculator Tools", path: "/calculator-tools" },
  // QR Tools
  "qr-code-scanner": { name: "QR Tools", path: "/qr-tools" },
  "qr-code-generator": { name: "QR Tools", path: "/qr-tools" },
};

// Export for use in ToolLayout
export const getCategoryForTool = (toolSlug: string): { name: string; path: string } | null => {
  return categoryMap[toolSlug] || null;
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
        name: category.name,
        path: category.path
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
        "item": "https://vexatool.com"
      },
      ...breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": `https://vexatool.com${item.path}`
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
