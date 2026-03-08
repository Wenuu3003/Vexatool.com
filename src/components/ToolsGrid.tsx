import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toolsData } from "@/data/toolsData";
import { cn } from "@/lib/utils";

const FEATURED_TOOL_IDS = [
  "merge-pdf",
  "compress-pdf",
  "split-pdf",
  "pdf-to-word",
  "word-to-pdf",
  "edit-pdf",
];

interface ToolsGridProps {
  maxItems?: number;
  categoryFilter?: string;
  title?: string;
}

export const ToolsGrid = ({ categoryFilter }: ToolsGridProps) => {
  let tools = FEATURED_TOOL_IDS
    .map((id) => toolsData.find((t) => t.id === id))
    .filter(Boolean) as typeof toolsData;

  if (categoryFilter) {
    tools = toolsData.filter((t) => t.category === categoryFilter).slice(0, 6);
  }

  return (
    <section id="tools-grid" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.href}
                className={cn(
                  "group flex flex-col items-center text-center p-7 rounded-2xl bg-card border border-border/50",
                  "shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    tool.colorClass
                  )}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1 leading-tight">
                  {tool.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-5 line-clamp-2 leading-relaxed max-w-[200px]">
                  {tool.shortDescription}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium text-primary",
                    "px-4 py-1.5 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors"
                  )}
                >
                  Open Tool
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center mt-14">
          <Link
            to="/all-tools"
            className={cn(
              "inline-flex items-center gap-2 px-7 py-2.5 rounded-lg text-sm font-semibold",
              "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            )}
          >
            View All Tools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
