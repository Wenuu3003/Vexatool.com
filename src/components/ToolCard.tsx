import { forwardRef } from "react";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  href?: string;
}

export const ToolCard = forwardRef<HTMLAnchorElement, ToolCardProps>(
  ({ title, description, icon: Icon, colorClass, href = "#" }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className="group block p-6 bg-card rounded-xl shadow-tool-card hover:shadow-tool-card-hover transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-border"
      >
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </a>
    );
  }
);

ToolCard.displayName = "ToolCard";
