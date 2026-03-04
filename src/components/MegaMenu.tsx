import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Image,
  QrCode,
  ScanLine,
  Layers,
  Scissors,
  FileDown,
  FileText,
  Lock,
  Unlock,
  RotateCw,
  FileEdit,
  Eraser,
  RefreshCw,
  Table,
  FileSpreadsheet,
  Presentation,
  Calculator,
  Percent,
  Scale,
  Cake,
  Heart,
  AlignLeft,
  MapPin,
  Crop,
  ImageDown,
  FileType2,
  Wrench,
  PenTool,
  Droplets,
  FolderSync,
  FileCheck,
  FileImage,
  Code,
  Smartphone,
  CreditCard,
  Briefcase,
  DollarSign,
  Ruler,
  HardDrive,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Tool {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: "new" | "popular";
}

interface Category {
  name: string;
  icon: React.ElementType;
  tools: Tool[];
}

const categories: Category[] = [
  {
    name: "PDF Tools",
    icon: FileText,
    tools: [
      { name: "PDF Editor", href: "/edit-pdf", icon: FileEdit, badge: "popular" },
      { name: "Merge PDF", href: "/merge-pdf", icon: Layers, badge: "popular" },
      { name: "Split PDF", href: "/split-pdf", icon: Scissors },
      { name: "Compress PDF", href: "/compress-pdf", icon: FileDown, badge: "popular" },
      { name: "PDF to Word", href: "/pdf-to-word", icon: FileType2 },
      { name: "Word to PDF", href: "/word-to-pdf", icon: FileText },
      { name: "Sign PDF", href: "/sign-pdf", icon: PenTool },
      { name: "Watermark PDF", href: "/watermark-pdf", icon: Droplets },
      { name: "Unlock PDF", href: "/unlock-pdf", icon: Unlock },
      { name: "Protect PDF", href: "/protect-pdf", icon: Lock },
      { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw },
      { name: "Organize PDF", href: "/organize-pdf", icon: FolderSync },
      { name: "Repair PDF", href: "/repair-pdf", icon: FileCheck },
      { name: "JPG to PDF", href: "/jpg-to-pdf", icon: Image },
      { name: "PNG to PDF", href: "/png-to-pdf", icon: Image },
      { name: "PDF to JPG", href: "/pdf-to-jpg", icon: Image },
      { name: "PDF to PNG", href: "/pdf-to-png", icon: Image },
      { name: "PDF to Image", href: "/pdf-to-image", icon: FileImage },
      { name: "PDF to HTML", href: "/pdf-to-html", icon: Code },
    ],
  },
  {
    name: "Image Tools",
    icon: Image,
    tools: [
      { name: "Image Resizer", href: "/image-resizer", icon: Crop, badge: "popular" },
      { name: "Image Compressor", href: "/compress-image", icon: ImageDown },
      { name: "Image Converter", href: "/image-format-converter", icon: RefreshCw },
      { name: "Image to PDF", href: "/image-to-pdf", icon: Image },
      { name: "Background Remover", href: "/background-remover", icon: Eraser, badge: "popular" },
      { name: "File Compressor", href: "/file-compressor", icon: FileDown },
      { name: "WhatsApp DP Resizer", href: "/whatsapp-dp-resize", icon: Smartphone },
      { name: "Aadhaar Photo Resizer", href: "/aadhaar-photo-resize", icon: CreditCard },
      { name: "Govt Job Photo Resizer", href: "/govt-job-photo-resize", icon: Briefcase },
      { name: "Passport Photo Resizer", href: "/passport-photo-resize", icon: FileImage },
    ],
  },
  {
    name: "Calculators",
    icon: Calculator,
    tools: [
      { name: "Scientific Calculator", href: "/calculator", icon: Calculator },
      { name: "Love Calculator", href: "/love-calculator", icon: Heart, badge: "popular" },
      { name: "BMI Calculator", href: "/bmi-calculator", icon: Scale },
      { name: "Age Calculator", href: "/age-calculator", icon: Cake },
      { name: "Percentage Calculator", href: "/percentage-calculator", icon: Percent, badge: "new" },
      { name: "EMI Calculator", href: "/emi-calculator", icon: Percent },
      { name: "GST Calculator", href: "/gst-calculator", icon: Percent },
      { name: "Currency Converter", href: "/currency-converter", icon: DollarSign },
    ],
  },
  {
    name: "QR Tools",
    icon: QrCode,
    tools: [
      { name: "QR Code Generator", href: "/qr-code-generator", icon: QrCode, badge: "popular" },
      { name: "QR Code Scanner", href: "/qr-code-scanner", icon: ScanLine },
    ],
  },
  {
    name: "Utilities",
    icon: Wrench,
    tools: [
      { name: "PIN Code Generator", href: "/pincode-generator", icon: MapPin },
      { name: "Word Counter", href: "/word-counter", icon: AlignLeft },
      { name: "Unit Converter", href: "/unit-converter", icon: Ruler },
    ],
  },
  {
    name: "Doc Converters",
    icon: FileSpreadsheet,
    tools: [
      { name: "PDF to Excel", href: "/pdf-to-excel", icon: Table },
      { name: "Excel to PDF", href: "/excel-to-pdf", icon: Table },
      { name: "PDF to PowerPoint", href: "/pdf-to-powerpoint", icon: Presentation },
      { name: "Word to Excel", href: "/word-to-excel", icon: Table },
      { name: "Excel to Word", href: "/excel-to-word", icon: FileText },
      { name: "PPT to PDF", href: "/ppt-to-pdf", icon: Presentation },
      { name: "HTML to PDF", href: "/html-to-pdf", icon: Code },
      { name: "Google Drive to PDF", href: "/google-drive-to-pdf", icon: HardDrive },
    ],
  },
];

interface MegaMenuProps {
  onNavigate?: () => void;
}

export const MegaMenu = ({ onNavigate }: MegaMenuProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const allTools = categories.flatMap((c) => c.tools);
  const uniqueTools = allTools.filter((tool, index, self) => 
    index === self.findIndex(t => t.href === tool.href)
  );
  
  const searchResults = searchQuery
    ? uniqueTools.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="w-full max-h-[70vh] overflow-hidden flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-10" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {searchQuery && searchResults.length > 0 && (
        <ScrollArea className="flex-1 overscroll-contain">
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Search Results ({searchResults.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {searchResults.map((tool) => (
                <Link key={tool.href} to={tool.href} onClick={onNavigate} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                  <tool.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{tool.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}

      {!searchQuery && (
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="grid md:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-border">
            {categories.map((category) => (
              <div key={category.name} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <category.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                </div>
                <div className="space-y-1">
                  {category.tools.map((tool) => (
                    <Link key={tool.href} to={tool.href} onClick={onNavigate} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group">
                      <tool.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm truncate">{tool.name}</span>
                      {tool.badge && (
                        <Badge variant="secondary" className={cn("text-[10px] px-1 py-0 ml-auto shrink-0", tool.badge === "new" && "bg-green-500 text-white", tool.badge === "popular" && "bg-pink-500 text-white")}>
                          {tool.badge === "new" ? "NEW" : "HOT"}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const MobileMegaMenu = ({ onNavigate }: MegaMenuProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategory = (name: string) => {
    setExpandedCategory(expandedCategory === name ? null : name);
  };

  const allTools = categories.flatMap((c) => c.tools);
  const uniqueTools = allTools.filter((tool, index, self) => 
    index === self.findIndex(t => t.href === tool.href)
  );
  
  const searchResults = searchQuery
    ? uniqueTools.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="py-4 h-full overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {searchQuery && searchResults.length > 0 && (
        <div className="px-4 pb-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">{searchResults.length} results</p>
          {searchResults.map((tool) => (
            <Link key={tool.href} to={tool.href} onClick={onNavigate} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted">
              <tool.icon className="w-5 h-5 text-primary" />
              <span>{tool.name}</span>
            </Link>
          ))}
        </div>
      )}

      {!searchQuery && (
        <div className="space-y-1">
          {categories.map((category) => (
            <div key={category.name}>
              <button onClick={() => toggleCategory(category.name)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <category.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">({category.tools.length})</span>
                </div>
                <ChevronDown className={cn("w-5 h-5 transition-transform", expandedCategory === category.name && "rotate-180")} />
              </button>
              {expandedCategory === category.name && (
                <div className="bg-muted/50 py-2">
                  {category.tools.map((tool) => (
                    <Link key={tool.href} to={tool.href} onClick={onNavigate} className="flex items-center gap-3 px-8 py-2.5 hover:bg-muted">
                      <tool.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{tool.name}</span>
                      {tool.badge && (
                        <Badge className={cn("ml-auto text-[10px]", tool.badge === "new" && "bg-green-500", tool.badge === "popular" && "bg-pink-500")}>
                          {tool.badge === "new" ? "NEW" : "HOT"}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
