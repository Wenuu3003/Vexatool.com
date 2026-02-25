import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { toolsData } from "@/data/toolsData";
import { cn } from "@/lib/utils";

interface ToolsGridProps {
  maxItems?: number;
  categoryFilter?: string;
  title?: string;
}

export const ToolsGrid = ({ maxItems, categoryFilter, title = "Popular PDF Tools" }: ToolsGridProps) => {
  let tools = toolsData;

  if (categoryFilter) {
    tools = tools.filter(t => t.category === categoryFilter);
  }

  if (maxItems) {
    tools = tools.slice(0, maxItems);
  }

  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-foreground">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.href}
                className={cn(
                  "group flex items-start gap-4 p-5 rounded-xl bg-card border border-border",
                  "shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                )}
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1 leading-tight">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                    {tool.shortDescription}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Tool
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
