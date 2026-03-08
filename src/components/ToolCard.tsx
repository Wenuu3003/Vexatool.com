import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  href?: string;
  index?: number;
}

export const ToolCard = ({
  title,
  description,
  icon: Icon,
  colorClass,
  href = "#",
}: ToolCardProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "group block p-6 bg-card rounded-2xl border border-border shadow-sm",
        "hover:shadow-lg transition-shadow duration-200 hover:-translate-y-0.5"
      )}
      aria-label={`${title} - ${description}`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${colorClass}`}
      >
        <Icon className="w-7 h-7 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold mb-2 leading-tight text-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed line-clamp-2 text-muted-foreground">
        {description}
      </p>
    </Link>
  );
};
