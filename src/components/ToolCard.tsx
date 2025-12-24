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
      className="group block p-6 bg-card rounded-xl shadow-tool-card hover:shadow-tool-card-hover transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-border"
      aria-label={`${title} - ${description}`}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
        <Icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Link>
  );
};
