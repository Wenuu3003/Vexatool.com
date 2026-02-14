import { Link } from "react-router-dom";
import { 
  QrCode, 
  ImageOff, 
  MessageCircle,
  ScanLine,
  Youtube,
  Heart,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const popularTools = [
  { name: "Love Calculator", href: "/love-calculator", icon: Heart, gradient: "from-pink-500 to-rose-500" },
  { name: "WhatsApp Analyzer", href: "/whatsapp-analyzer", icon: MessageCircle, gradient: "from-green-500 to-emerald-500" },
  { name: "QR Generator", href: "/qr-code-generator", icon: QrCode, gradient: "from-blue-500 to-indigo-500" },
  { name: "QR Scanner", href: "/qr-code-scanner", icon: ScanLine, gradient: "from-violet-500 to-purple-500" },
  { name: "YouTube Tags", href: "/youtube-generator", icon: Youtube, gradient: "from-red-500 to-orange-500" },
  { name: "Remove BG", href: "/background-remover", icon: ImageOff, gradient: "from-amber-500 to-yellow-500" },
];

export const QuickAccessBar = () => {
  return (
    <div className="sticky top-16 z-40 bg-background/60 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-2 sm:px-4">
        <div 
          className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 py-2 overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground shrink-0 hidden sm:flex">
            <Sparkles className="w-3 h-3" />
            Popular
          </span>
          {popularTools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className={cn(
                "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "text-xs font-medium whitespace-nowrap",
                "bg-muted/60 hover:bg-muted",
                "border border-border/40 hover:border-border",
                "transition-all duration-300 shrink-0",
                "hover:shadow-sm hover:-translate-y-px"
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br text-white shrink-0",
                tool.gradient
              )}>
                <tool.icon className="w-2.5 h-2.5" />
              </span>
              <span className="hidden xs:inline sm:inline">{tool.name}</span>
              <span className="xs:hidden sm:hidden">{tool.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
