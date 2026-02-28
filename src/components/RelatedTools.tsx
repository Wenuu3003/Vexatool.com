import { Link } from "react-router-dom";
import { 
  FileText, Files, FileDown, FileUp, FileCheck, FileX, 
  Image, ImagePlus, Camera, Scissors, RotateCw, Lock, Unlock,
  Edit, Stamp, Shield, Wrench, FileImage, FileSpreadsheet,
  Presentation, Code, Sparkles, MessageSquare, Search, 
  Calculator, Percent, Scale, Calendar, Heart,
  QrCode, ScanLine, Globe, IndianRupee, MapPin, Type
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedTool {
  path: string;
  name: string;
  icon: React.ElementType;
  colorClass: string;
}

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

// Tool metadata
const toolMeta: Record<string, { name: string; icon: React.ElementType; colorClass: string }> = {
  // PDF Tools
  "/merge-pdf": { name: "Merge PDF", icon: Files, colorClass: "bg-red-500" },
  "/split-pdf": { name: "Split PDF", icon: Scissors, colorClass: "bg-orange-500" },
  "/compress-pdf": { name: "Compress PDF", icon: FileDown, colorClass: "bg-green-500" },
  "/pdf-to-word": { name: "PDF to Word", icon: FileText, colorClass: "bg-blue-500" },
  "/edit-pdf": { name: "Edit PDF", icon: Edit, colorClass: "bg-purple-500" },
  "/sign-pdf": { name: "Sign PDF", icon: FileCheck, colorClass: "bg-indigo-500" },
  "/watermark-pdf": { name: "Watermark PDF", icon: Stamp, colorClass: "bg-teal-500" },
  "/rotate-pdf": { name: "Rotate PDF", icon: RotateCw, colorClass: "bg-cyan-500" },
  "/unlock-pdf": { name: "Unlock PDF", icon: Unlock, colorClass: "bg-amber-500" },
  "/protect-pdf": { name: "Protect PDF", icon: Lock, colorClass: "bg-rose-500" },
  "/organize-pdf": { name: "Organize PDF", icon: FileUp, colorClass: "bg-violet-500" },
  "/repair-pdf": { name: "Repair PDF", icon: Wrench, colorClass: "bg-slate-500" },
  "/pdf-to-image": { name: "PDF to Image", icon: FileImage, colorClass: "bg-pink-500" },
  "/pdf-to-jpg": { name: "PDF to JPG", icon: Image, colorClass: "bg-yellow-500" },
  "/pdf-to-png": { name: "PDF to PNG", icon: Image, colorClass: "bg-lime-500" },
  "/pdf-to-html": { name: "PDF to HTML", icon: Code, colorClass: "bg-sky-500" },
  "/pdf-to-powerpoint": { name: "PDF to PowerPoint", icon: Presentation, colorClass: "bg-orange-600" },
  "/pdf-to-excel": { name: "PDF to Excel", icon: FileSpreadsheet, colorClass: "bg-emerald-500" },
  
  // Convert to PDF
  "/word-to-pdf": { name: "Word to PDF", icon: FileText, colorClass: "bg-blue-600" },
  "/excel-to-pdf": { name: "Excel to PDF", icon: FileSpreadsheet, colorClass: "bg-green-600" },
  "/ppt-to-pdf": { name: "PPT to PDF", icon: Presentation, colorClass: "bg-red-600" },
  "/html-to-pdf": { name: "HTML to PDF", icon: Code, colorClass: "bg-orange-500" },
  "/image-to-pdf": { name: "Image to PDF", icon: ImagePlus, colorClass: "bg-purple-600" },
  "/jpg-to-pdf": { name: "JPG to PDF", icon: Image, colorClass: "bg-amber-600" },
  "/png-to-pdf": { name: "PNG to PDF", icon: Image, colorClass: "bg-teal-600" },
  "/google-drive-to-pdf": { name: "Google Drive to PDF", icon: Globe, colorClass: "bg-blue-500" },
  "/word-to-excel": { name: "Word to Excel", icon: FileSpreadsheet, colorClass: "bg-indigo-500" },
  "/excel-to-word": { name: "Excel to Word", icon: FileText, colorClass: "bg-violet-500" },
  
  // Image Tools
  "/compress-image": { name: "Compress Image", icon: FileDown, colorClass: "bg-green-500" },
  "/image-resizer": { name: "Image Resizer", icon: Image, colorClass: "bg-blue-500" },
  "/image-format-converter": { name: "Image Converter", icon: Image, colorClass: "bg-purple-500" },
  "/background-remover": { name: "Background Remover", icon: Sparkles, colorClass: "bg-pink-500" },
  "/file-compressor": { name: "File Compressor", icon: FileDown, colorClass: "bg-teal-500" },
  
  // Utility
  "/word-counter": { name: "Word Counter", icon: Type, colorClass: "bg-blue-600" },
  
  // Calculator Tools
  "/calculator": { name: "Calculator", icon: Calculator, colorClass: "bg-gray-600" },
  "/age-calculator": { name: "Age Calculator", icon: Calendar, colorClass: "bg-blue-600" },
  "/love-calculator": { name: "Love Calculator", icon: Heart, colorClass: "bg-pink-600" },
  "/bmi-calculator": { name: "BMI Calculator", icon: Heart, colorClass: "bg-red-500" },
  "/emi-calculator": { name: "EMI Calculator", icon: IndianRupee, colorClass: "bg-green-600" },
  "/gst-calculator": { name: "GST Calculator", icon: Percent, colorClass: "bg-blue-600" },
  "/unit-converter": { name: "Unit Converter", icon: Scale, colorClass: "bg-orange-500" },
  "/currency-converter": { name: "Currency Converter", icon: IndianRupee, colorClass: "bg-emerald-500" },
  
  // Utility Tools
  "/qr-code-generator": { name: "QR Code Generator", icon: QrCode, colorClass: "bg-purple-600" },
  "/qr-code-scanner": { name: "QR Code Scanner", icon: ScanLine, colorClass: "bg-blue-600" },
  "/pincode-generator": { name: "PIN Code Finder", icon: MapPin, colorClass: "bg-red-600" },
};

interface RelatedToolsProps {
  currentPath: string;
  className?: string;
  maxTools?: number;
}

export const RelatedTools = ({ currentPath, className = "", maxTools = 5 }: RelatedToolsProps) => {
  const relatedPaths = toolRelationships[currentPath] || [];
  
  if (relatedPaths.length === 0) return null;
  
  const relatedTools: RelatedTool[] = relatedPaths
    .slice(0, maxTools)
    .map(path => ({
      path,
      ...toolMeta[path]
    }))
    .filter(tool => tool.name);

  if (relatedTools.length === 0) return null;

  return (
    <section className={cn("mt-8 pt-8 border-t border-border", className)}>
      <h2 className="text-xl font-bold text-foreground mb-4">Related Tools You Might Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {relatedTools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
              tool.colorClass
            )}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors">
              {tool.name}
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