import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BacklinkCTAProps {
  currentTool?: string;
}

export const BacklinkCTA = ({ currentTool }: BacklinkCTAProps) => {
  const popularTools = [
    { name: "Merge PDF", path: "/merge-pdf", icon: "📄" },
    { name: "Compress PDF", path: "/compress-pdf", icon: "🗜️" },
    { name: "AI Chat", path: "/ai-chat", icon: "🤖" },
    { name: "Image Compressor", path: "/compress-image", icon: "🖼️" },
    { name: "QR Generator", path: "/qr-code-generator", icon: "📱" },
    { name: "Word Counter", path: "/word-counter", icon: "✍️" },
  ].filter(tool => !currentTool?.toLowerCase().includes(tool.name.toLowerCase().split(' ')[0]));

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-6 md:p-8 border border-border mt-8">
      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-green-500" />
          <span>100% Secure</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Fast Processing</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="w-4 h-4 text-blue-500" />
          <span>Free Forever</span>
        </div>
      </div>

      {/* Main CTA */}
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Explore 50+ Free Tools
        </h3>
        <p className="text-muted-foreground max-w-lg mx-auto">
          PDF converters, image editors, AI tools, calculators, and more. All free, all secure, all in your browser.
        </p>
      </div>

      {/* Quick links to popular tools */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {popularTools.slice(0, 6).map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="flex items-center gap-2 p-3 rounded-lg bg-background/80 border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm group"
          >
            <span className="text-lg">{tool.icon}</span>
            <span className="text-foreground group-hover:text-primary transition-colors truncate">
              {tool.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Main action button */}
      <div className="text-center">
        <Link to="/#tools">
          <Button size="lg" className="gap-2 group">
            View All Tools
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* SEO-friendly text links */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Looking for more? Try our{" "}
          <Link to="/ai-chat" className="text-primary hover:underline">AI Chat Assistant</Link>,{" "}
          <Link to="/background-remover" className="text-primary hover:underline">Background Remover</Link>,{" "}
          <Link to="/currency-converter" className="text-primary hover:underline">Currency Converter</Link>, or{" "}
          <Link to="/emi-calculator" className="text-primary hover:underline">EMI Calculator</Link>.
          All tools are{" "}
          <Link to="/" className="text-primary hover:underline font-medium">free at VexaTool</Link>.
        </p>
      </div>
    </div>
  );
};
