import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  href?: string;
}

export const ToolCard = ({ title, description, icon: Icon, colorClass, href = "#" }: ToolCardProps) => {
  return (
    <Link
      to={href}
      className="group block p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      aria-label={`${title} - ${description}`}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 ${colorClass}`}>
        <Icon className="w-7 h-7 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {description}
      </p>
    </Link>
  );
};
