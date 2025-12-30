import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  Search,
  X,
  // AI Tools
  Bot,
  FileUser,
  ImageOff,
  QrCode,
  Sparkles,
  MessageSquare,
  Palette,
  Mic,
  // Image Tools
  Image,
  Minimize2,
  Crop,
  FileImage,
  Wand2,
  // PDF Tools
  Merge,
  Split,
  FileDown,
  FileText,
  Lock,
  Unlock,
  RotateCw,
  Droplets,
  // Calculators
  Calculator,
  Percent,
  Scale,
  Calendar,
  Coins,
  Ruler,
  TrendingUp,
  // Social Tools
  Instagram,
  Youtube,
  Link2,
  Hash,
  Share2,
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
      { name: "AI Text Generator", href: "/ai-text-generator", icon: Sparkles },
      { name: "AI Grammar Tool", href: "/ai-grammar-tool", icon: MessageSquare },
      { name: "AI Chat", href: "/ai-chat", icon: Bot },
      { name: "AI Search", href: "/ai-search", icon: Search },
      { name: "QR Code Generator", href: "/qr-code-generator", icon: QrCode },
      { name: "Hashtag Generator", href: "/hashtag-generator", icon: Hash, badge: "new" },
    ],
  },
  {
    name: "Image Tools",
    icon: Image,
    tools: [
      { name: "Background Remover", href: "/background-remover", icon: ImageOff, badge: "popular" },
      { name: "Image Compressor", href: "/compress-image", icon: Minimize2 },
      { name: "Image Resizer", href: "/image-resizer", icon: Crop },
      { name: "Image Converter", href: "/image-format-converter", icon: FileImage },
      { name: "Image to PDF", href: "/image-to-pdf", icon: FileImage },
      { name: "JPG to PDF", href: "/jpg-to-pdf", icon: FileImage },
      { name: "PNG to PDF", href: "/png-to-pdf", icon: FileImage },
    ],
  },
  {
    name: "PDF Tools",
    icon: FileText,
    tools: [
      { name: "Merge PDF", href: "/merge-pdf", icon: Merge, badge: "popular" },
      { name: "Split PDF", href: "/split-pdf", icon: Split },
      { name: "Compress PDF", href: "/compress-pdf", icon: FileDown },
      { name: "PDF to Word", href: "/pdf-to-word", icon: FileText },
      { name: "Word to PDF", href: "/word-to-pdf", icon: FileText },
      { name: "PDF to Image", href: "/pdf-to-image", icon: Image },
      { name: "Lock PDF", href: "/protect-pdf", icon: Lock },
      { name: "Unlock PDF", href: "/unlock-pdf", icon: Unlock },
      { name: "Rotate PDF", href: "/rotate-pdf", icon: RotateCw },
      { name: "Watermark PDF", href: "/watermark-pdf", icon: Droplets },
      { name: "Edit PDF", href: "/edit-pdf", icon: FileText },
      { name: "Sign PDF", href: "/sign-pdf", icon: FileText },
    ],
  },
  {
    name: "Calculators",
    icon: Calculator,
    tools: [
      { name: "EMI Calculator", href: "/emi-calculator", icon: TrendingUp, badge: "popular" },
      { name: "GST Calculator", href: "/gst-calculator", icon: Percent },
      { name: "BMI Calculator", href: "/bmi-calculator", icon: Scale },
      { name: "Age Calculator", href: "/age-calculator", icon: Calendar },
      { name: "Currency Converter", href: "/currency-converter", icon: Coins },
      { name: "Unit Converter", href: "/unit-converter", icon: Ruler },
      { name: "Calculator", href: "/calculator", icon: Calculator },
    ],
  },
  {
    name: "Social Tools",
    icon: Share2,
    tools: [
      { name: "YouTube Generator", href: "/youtube-generator", icon: Youtube, badge: "new" },
      { name: "Hashtag Generator", href: "/hashtag-generator", icon: Hash },
      { name: "QR Code Scanner", href: "/qr-code-scanner", icon: QrCode },
      { name: "Word Counter", href: "/word-counter", icon: FileText },
      { name: "SEO Tool", href: "/seo-tool", icon: Search },
    ],
  },
];

interface MegaMenuProps {
  onNavigate?: () => void;
}

export const MegaMenu = ({ onNavigate }: MegaMenuProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.map((category) => ({
    ...category,
    tools: category.tools.filter((tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.tools.length > 0);

  const allTools = categories.flatMap((c) => c.tools);
  const searchResults = searchQuery
    ? allTools.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
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
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Search Results</h3>
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
      )}

      {/* Categories */}
      {!searchQuery && (
        <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border">
          {categories.map((category) => (
            <div key={category.name} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <category.icon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-sm">{category.name}</h3>
              </div>
              <div className="space-y-1">
                {category.tools.slice(0, 6).map((tool) => (
                  <Link
                    key={tool.href}
                    to={tool.href}
                    onClick={onNavigate}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <tool.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm">{tool.name}</span>
                    {tool.badge && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1 py-0 ml-auto",
                          tool.badge === "new" && "bg-green-500 text-white",
                          tool.badge === "popular" && "bg-pink-500 text-white"
                        )}
                      >
                        {tool.badge === "new" ? "NEW" : "HOT"}
                      </Badge>
                    )}
                  </Link>
                ))}
                {category.tools.length > 6 && (
                  <Link
                    to="/"
                    onClick={onNavigate}
                    className="text-xs text-primary hover:underline pl-2"
                  >
                    +{category.tools.length - 6} more
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
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
  const searchResults = searchQuery
    ? allTools.filter((tool) =>
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
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && searchResults.length > 0 && (
        <div className="px-4 pb-4 border-b border-border">
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
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform",
                    expandedCategory === category.name && "rotate-180"
                  )}
                />
              </button>
              {expandedCategory === category.name && (
                <div className="bg-muted/50 py-2">
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
