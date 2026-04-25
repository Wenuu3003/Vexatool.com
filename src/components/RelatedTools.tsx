import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toolsData, type ToolData } from "@/data/toolsData";

// Source of truth: every related-tool card uses the same icon, name and
// color gradient as the actual tool page it links to. This guarantees the
// icon a user sees in the "Related Tools" grid is identical to the icon on
// the destination tool page (no more colour/icon mismatch on click-through).

// Tool relationships mapping (AI tools removed)
const toolRelationships: Record<string, string[]> = {
  // PDF Tools
  "/merge-pdf": ["/split-pdf", "/compress-pdf", "/organize-pdf", "/pdf-to-word", "/edit-pdf"],
  "/split-pdf": ["/merge-pdf", "/organize-pdf", "/pdf-to-image", "/compress-pdf", "/rotate-pdf"],
  "/compress-pdf": ["/merge-pdf", "/compress-image", "/file-compressor", "/pdf-to-jpg", "/edit-pdf"],
  "/pdf-to-word": ["/word-to-pdf", "/pdf-to-excel", "/edit-pdf", "/pdf-to-html", "/compress-pdf"],
  "/edit-pdf": ["/sign-pdf", "/watermark-pdf", "/pdf-to-word", "/protect-pdf", "/merge-pdf"],
  "/sign-pdf": ["/edit-pdf", "/watermark-pdf", "/protect-pdf", "/pdf-to-image", "/merge-pdf"],
  "/watermark-pdf": ["/edit-pdf", "/sign-pdf", "/protect-pdf", "/merge-pdf", "/compress-pdf"],
  "/rotate-pdf": ["/organize-pdf", "/split-pdf", "/merge-pdf", "/compress-pdf", "/edit-pdf"],
  "/unlock-pdf": ["/protect-pdf", "/edit-pdf", "/compress-pdf", "/pdf-to-word", "/merge-pdf"],
  "/protect-pdf": ["/unlock-pdf", "/watermark-pdf", "/sign-pdf", "/edit-pdf", "/merge-pdf"],
  "/organize-pdf": ["/rotate-pdf", "/split-pdf", "/merge-pdf", "/pdf-to-image", "/compress-pdf"],
  "/repair-pdf": ["/compress-pdf", "/unlock-pdf", "/merge-pdf", "/pdf-to-word", "/edit-pdf"],
  "/pdf-to-image": ["/pdf-to-jpg", "/pdf-to-png", "/image-to-pdf", "/compress-image", "/pdf-to-word"],
  "/pdf-to-jpg": ["/pdf-to-png", "/pdf-to-image", "/jpg-to-pdf", "/compress-image", "/image-to-pdf"],
  "/pdf-to-png": ["/pdf-to-jpg", "/pdf-to-image", "/png-to-pdf", "/background-remover", "/compress-image"],
  "/pdf-to-html": ["/html-to-pdf", "/pdf-to-word", "/pdf-to-excel", "/edit-pdf", "/pdf-to-powerpoint"],
  "/pdf-to-powerpoint": ["/ppt-to-pdf", "/pdf-to-word", "/pdf-to-excel", "/pdf-to-image", "/pdf-to-html"],
  "/pdf-to-excel": ["/excel-to-pdf", "/pdf-to-word", "/word-to-excel", "/pdf-to-powerpoint", "/compress-pdf"],
  
  // Convert to PDF
  "/word-to-pdf": ["/pdf-to-word", "/excel-to-pdf", "/ppt-to-pdf", "/html-to-pdf", "/image-to-pdf"],
  "/excel-to-pdf": ["/pdf-to-excel", "/word-to-pdf", "/word-to-excel", "/excel-to-word", "/compress-pdf"],
  "/ppt-to-pdf": ["/pdf-to-powerpoint", "/word-to-pdf", "/image-to-pdf", "/google-drive-to-pdf", "/compress-pdf"],
  "/html-to-pdf": ["/pdf-to-html", "/word-to-pdf", "/image-to-pdf", "/word-counter", "/compress-pdf"],
  "/image-to-pdf": ["/jpg-to-pdf", "/png-to-pdf", "/pdf-to-image", "/compress-image", "/merge-pdf"],
  "/jpg-to-pdf": ["/png-to-pdf", "/image-to-pdf", "/pdf-to-jpg", "/compress-image", "/merge-pdf"],
  "/png-to-pdf": ["/jpg-to-pdf", "/image-to-pdf", "/pdf-to-png", "/background-remover", "/compress-image"],
  "/google-drive-to-pdf": ["/word-to-pdf", "/excel-to-pdf", "/ppt-to-pdf", "/compress-pdf", "/merge-pdf"],
  "/word-to-excel": ["/excel-to-word", "/word-to-pdf", "/pdf-to-excel", "/pdf-to-word", "/compress-pdf"],
  "/excel-to-word": ["/word-to-excel", "/excel-to-pdf", "/word-to-pdf", "/pdf-to-word", "/compress-pdf"],
  
  // Image Tools
  "/compress-image": ["/image-resizer", "/image-format-converter", "/compress-pdf", "/file-compressor", "/background-remover"],
  "/image-resizer": ["/compress-image", "/image-format-converter", "/background-remover", "/image-to-pdf", "/compress-pdf"],
  "/image-format-converter": ["/compress-image", "/image-resizer", "/jpg-to-pdf", "/png-to-pdf", "/background-remover"],
  "/background-remover": ["/compress-image", "/image-resizer", "/image-format-converter", "/png-to-pdf", "/image-to-pdf"],
  "/file-compressor": ["/compress-image", "/compress-pdf", "/image-resizer", "/merge-pdf", "/image-format-converter"],
  
  // Word Counter & Utility
  "/word-counter": ["/compress-pdf", "/word-to-pdf", "/pdf-to-word", "/edit-pdf", "/merge-pdf"],
  
  // Calculator Tools
  "/calculator": ["/gst-calculator", "/emi-calculator", "/unit-converter", "/currency-converter", "/bmi-calculator"],
  "/age-calculator": ["/love-calculator", "/bmi-calculator", "/calculator", "/emi-calculator", "/unit-converter"],
  "/love-calculator": ["/age-calculator", "/bmi-calculator", "/calculator", "/emi-calculator", "/qr-code-generator"],
  "/bmi-calculator": ["/age-calculator", "/love-calculator", "/calculator", "/unit-converter", "/emi-calculator"],
  "/emi-calculator": ["/gst-calculator", "/calculator", "/currency-converter", "/age-calculator", "/unit-converter"],
  "/gst-calculator": ["/emi-calculator", "/calculator", "/currency-converter", "/unit-converter", "/age-calculator"],
  "/unit-converter": ["/currency-converter", "/calculator", "/bmi-calculator", "/gst-calculator", "/emi-calculator"],
  "/currency-converter": ["/unit-converter", "/calculator", "/gst-calculator", "/emi-calculator", "/age-calculator"],
  
  // Utility Tools
  "/qr-code-generator": ["/qr-code-scanner", "/image-to-pdf", "/compress-image", "/image-resizer", "/merge-pdf"],
  "/qr-code-scanner": ["/qr-code-generator", "/image-format-converter", "/compress-image", "/background-remover", "/image-resizer"],
  "/pincode-generator": ["/calculator", "/gst-calculator", "/currency-converter", "/unit-converter", "/emi-calculator"],
};

// Build a path -> ToolData lookup once, derived from the global registry.
// This guarantees icons, colours, and names are always in sync with each
// tool's actual page (the icon on the related-tools card === icon on the
// destination page).
const toolsByPath: Record<string, ToolData> = toolsData.reduce((acc, t) => {
  acc[t.href] = t;
  return acc;
}, {} as Record<string, ToolData>);

interface RelatedToolsProps {
  currentPath: string;
  className?: string;
  maxTools?: number;
}

export const RelatedTools = ({ currentPath, className = "", maxTools = 5 }: RelatedToolsProps) => {
  const relatedPaths = toolRelationships[currentPath] || [];

  if (relatedPaths.length === 0) return null;

  // De-duplicate (defensive — never show the same tool twice, never show
  // the current tool in its own related list) and only keep paths that
  // actually exist in the registry.
  const seen = new Set<string>([currentPath]);
  const relatedTools = relatedPaths
    .filter((path) => {
      if (seen.has(path)) return false;
      if (!toolsByPath[path]) return false;
      seen.add(path);
      return true;
    })
    .slice(0, maxTools)
    .map((path) => toolsByPath[path]);

  if (relatedTools.length === 0) return null;

  return (
    <section className={cn("mt-8 pt-8 border-t border-border", className)}>
      <h2 className="text-xl font-bold text-foreground mb-4">Related Tools You Might Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {relatedTools.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
              tool.colorClass
            )}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors">
              {tool.title}
            </span>
          </Link>
        ))}
      </div>
      
      <p className="mt-4 text-sm text-muted-foreground">
        Looking for more tools? Check out our{" "}
        <Link to="/#tools-grid" className="text-primary hover:underline">complete collection of free online tools</Link>
        {" "}including PDF editors, image converters, and calculators.
      </p>
    </section>
  );
};