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
  // AI Tools
  Bot,
  FileUser,
  ImageOff,
  QrCode,
  Sparkles,
  MessageSquare,
  SpellCheck,
  // Image Tools
  Image,
  Minimize2,
  Crop,
  FileImage,
  Eraser,
  RefreshCw,
  // PDF Tools
  Layers,
  Scissors,
  FileDown,
  FileText,
  Lock,
  Unlock,
  RotateCw,
  Droplets,
  FileEdit,
  PenTool,
  LayoutGrid,
  Wrench,
  // Document Conversion
  Table,
  FileSpreadsheet,
  Presentation,
  Code,
  Cloud,
  // Calculators
  Calculator,
  Percent,
  Scale,
  Cake,
  Coins,
  Ruler,
  Heart,
  AlignLeft,
  // Social Tools
  Youtube,
  Hash,
  Share2,
  MapPin,
  MessageCircle,
  ScanLine,
  BarChart3,
  FileArchive,
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
    name: "AI Tools",
    icon: Bot,
    tools: [
      { name: "AI Resume Builder", href: "/ai-resume-builder", icon: FileUser, badge: "popular" },
      { name: "AI Background Remover", href: "/background-remover", icon: ImageOff, badge: "popular" },
      { name: "WhatsApp Analyzer", href: "/whatsapp-analyzer", icon: MessageCircle, badge: "new" },
      { name: "AI Text Generator", href: "/ai-text-generator", icon: Sparkles },
      { name: "AI Grammar Tool", href: "/ai-grammar-tool", icon: SpellCheck },
      { name: "AI Chat", href: "/ai-chat", icon: Bot },
      { name: "AI Search", href: "/ai-search", icon: Search },
      { name: "Hashtag Generator", href: "/hashtag-generator", icon: Hash },
      { name: "YouTube Generator", href: "/youtube-generator", icon: Youtube },
    ],
  },
  {
    name: "Image Tools",
    icon: Image,
    tools: [
      { name: "Background Remover", href: "/background-remover", icon: Eraser, badge: "popular" },
      { name: "Image Compressor", href: "/compress-image", icon: Minimize2 },
      { name: "Image Resizer", href: "/image-resizer", icon: Crop },
      { name: "Image Converter", href: "/image-format-converter", icon: RefreshCw },
      { name: "Image to PDF", href: "/image-to-pdf", icon: FileImage },
      { name: "JPG to PDF", href: "/jpg-to-pdf", icon: FileImage },
      { name: "PNG to PDF", href: "/png-to-pdf", icon: FileImage },
      { name: "PDF to Image", href: "/pdf-to-image", icon: Image },
      { name: "PDF to JPG", href: "/pdf-to-jpg", icon: Image },
      { name: "PDF to PNG", href: "/pdf-to-png", icon: Image },
    ],
  },
  {
    name: "PDF Tools",
    icon: FileText,
    tools: [
      { name: "Merge PDF", href: "/merge-pdf", icon: Layers, badge: "popular" },
      { name: "Split PDF", href: "/split-pdf", icon: Scissors },
      { name: "Compress PDF", href: "/compress-pdf", icon: FileDown, badge: "popular" },
      { name: "Edit PDF", href: "/edit-pdf", icon: FileEdit },
      { name: "Sign PDF", href: "/sign-pdf", icon: PenTool },
      { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw },
      { name: "Watermark PDF", href: "/watermark-pdf", icon: Droplets },
      { name: "Lock PDF", href: "/protect-pdf", icon: Lock },
      { name: "Unlock PDF", href: "/unlock-pdf", icon: Unlock },
      { name: "Organize PDF", href: "/organize-pdf", icon: LayoutGrid },
      { name: "Repair PDF", href: "/repair-pdf", icon: Wrench },
    ],
  },
  {
    name: "Document Convert",
    icon: FileSpreadsheet,
    tools: [
      { name: "PDF to Word", href: "/pdf-to-word", icon: FileText, badge: "popular" },
      { name: "Word to PDF", href: "/word-to-pdf", icon: FileText },
      { name: "PDF to Excel", href: "/pdf-to-excel", icon: Table },
      { name: "Excel to PDF", href: "/excel-to-pdf", icon: Table },
      { name: "Word to Excel", href: "/word-to-excel", icon: FileSpreadsheet },
      { name: "Excel to Word", href: "/excel-to-word", icon: FileText },
      { name: "PDF to PowerPoint", href: "/pdf-to-powerpoint", icon: Presentation },
      { name: "PPT to PDF", href: "/ppt-to-pdf", icon: Presentation },
      { name: "PDF to HTML", href: "/pdf-to-html", icon: Code },
      { name: "HTML to PDF", href: "/html-to-pdf", icon: Code },
      { name: "Google Drive to PDF", href: "/google-drive-to-pdf", icon: Cloud },
    ],
  },
  {
    name: "Calculators",
    icon: Calculator,
    tools: [
      { name: "EMI Calculator", href: "/emi-calculator", icon: Percent, badge: "popular" },
      { name: "GST Calculator", href: "/gst-calculator", icon: Percent },
      { name: "BMI Calculator", href: "/bmi-calculator", icon: Heart },
      { name: "Age Calculator", href: "/age-calculator", icon: Cake },
      { name: "Currency Converter", href: "/currency-converter", icon: Coins },
      { name: "Unit Converter", href: "/unit-converter", icon: Ruler },
      { name: "Calculator", href: "/calculator", icon: Calculator },
    ],
  },
  {
    name: "Utilities",
    icon: Share2,
    tools: [
      { name: "QR Code Generator", href: "/qr-code-generator", icon: QrCode, badge: "popular" },
      { name: "QR Code Scanner", href: "/qr-code-scanner", icon: ScanLine },
      { name: "PIN Code Generator", href: "/pincode-generator", icon: MapPin },
      { name: "Word Counter", href: "/word-counter", icon: AlignLeft },
      { name: "SEO Tool", href: "/seo-tool", icon: BarChart3 },
      { name: "File Compressor", href: "/file-compressor", icon: FileArchive },
    ],
  },
];

interface MegaMenuProps {
  onNavigate?: () => void;
}

export const MegaMenu = ({ onNavigate }: MegaMenuProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
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
    <div className="w-full max-h-[70vh] overflow-hidden flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && searchResults.length > 0 && (
        <ScrollArea className="flex-1">
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Search Results ({searchResults.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {searchResults.map((tool) => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  onClick={onNavigate}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <tool.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{tool.name}</span>
                  {tool.badge && (
                    <Badge
                      variant={tool.badge === "new" ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] px-1 py-0",
                        tool.badge === "new" && "bg-green-500",
                        tool.badge === "popular" && "bg-pink-500 text-white"
                      )}
                    >
                      {tool.badge === "new" ? "NEW" : "HOT"}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}

      {/* Categories */}
      {!searchQuery && (
        <ScrollArea className="flex-1">
          <div className="grid md:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-border">
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category.name);
              const visibleTools = isExpanded ? category.tools : category.tools.slice(0, 6);
              const hasMore = category.tools.length > 6;
              
              return (
                <div key={category.name} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                  </div>
                  <div className="space-y-1">
                    {visibleTools.map((tool) => (
                      <Link
                        key={tool.href}
                        to={tool.href}
                        onClick={onNavigate}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <tool.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm truncate">{tool.name}</span>
                        {tool.badge && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-1 py-0 ml-auto shrink-0",
                              tool.badge === "new" && "bg-green-500 text-white",
                              tool.badge === "popular" && "bg-pink-500 text-white"
                            )}
                          >
                            {tool.badge === "new" ? "NEW" : "HOT"}
                          </Badge>
                        )}
                      </Link>
                    ))}
                    {hasMore && (
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline pl-2 pt-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            +{category.tools.length - 6} more
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

// Mobile version with expandable sections
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
    <div className="py-4">
      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && searchResults.length > 0 && (
        <div className="px-4 pb-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">{searchResults.length} results</p>
          {searchResults.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              onClick={onNavigate}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted"
            >
              <tool.icon className="w-5 h-5 text-primary" />
              <span>{tool.name}</span>
              {tool.badge && (
                <Badge
                  className={cn(
                    "ml-auto",
                    tool.badge === "new" && "bg-green-500",
                    tool.badge === "popular" && "bg-pink-500"
                  )}
                >
                  {tool.badge === "new" ? "NEW" : "HOT"}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Categories */}
      {!searchQuery && (
        <div className="space-y-1">
          {categories.map((category) => (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <category.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">({category.tools.length})</span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform",
                    expandedCategory === category.name && "rotate-180"
                  )}
                />
              </button>
              {expandedCategory === category.name && (
                <div className="bg-muted/50 py-2 max-h-[50vh] overflow-y-auto">
                  {category.tools.map((tool) => (
                    <Link
                      key={tool.href}
                      to={tool.href}
                      onClick={onNavigate}
                      className="flex items-center gap-3 px-8 py-2.5 hover:bg-muted"
                    >
                      <tool.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{tool.name}</span>
                      {tool.badge && (
                        <Badge
                          className={cn(
                            "ml-auto text-[10px]",
                            tool.badge === "new" && "bg-green-500",
                            tool.badge === "popular" && "bg-pink-500"
                          )}
                        >
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
