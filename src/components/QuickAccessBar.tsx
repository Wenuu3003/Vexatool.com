import { Link } from "react-router-dom";
import { 
  Layers, 
  FileDown, 
  QrCode, 
  FileUser, 
  ImageOff 
} from "lucide-react";
import { cn } from "@/lib/utils";

const popularTools = [
  { name: "Merge PDF", href: "/merge-pdf", icon: Layers },
  { name: "Compress PDF", href: "/compress-pdf", icon: FileDown },
  { name: "QR Generator", href: "/qr-code-generator", icon: QrCode },
  { name: "AI Resume", href: "/ai-resume-builder", icon: FileUser },
  { name: "Remove BG", href: "/background-remover", icon: ImageOff },
];

export const QuickAccessBar = () => {
  return (
    <div className="sticky top-16 z-40 bg-muted/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-center gap-1 sm:gap-2 py-1.5 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">Quick:</span>
          {popularTools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
                "text-xs font-medium whitespace-nowrap",
                "bg-background hover:bg-primary hover:text-primary-foreground",
                "border border-border hover:border-primary",
                "transition-all duration-200 shrink-0"
              )}
            >
              <tool.icon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">{tool.name}</span>
              <span className="xs:hidden sm:hidden">{tool.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
