import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
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
  index = 0
}: ToolCardProps) => {
  const {
    ref,
    isVisible
  } = useScrollAnimation<HTMLAnchorElement>({
    threshold: 0.1,
    rootMargin: "0px 0px -30px 0px"
  });

  // Stagger delay based on index (max 8 cards per row consideration)
  const staggerDelay = Math.min(index % 4, 3) * 0.05;
  return <Link ref={ref} to={href} className={cn("group block p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{
    transitionDelay: isVisible ? `${staggerDelay}s` : "0s",
    transitionProperty: "opacity, transform, box-shadow"
  }} aria-label={`${title} - ${description}`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 ${colorClass}`}>
        <Icon className="w-7 h-7 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold mb-2 transition-colors leading-tight text-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed line-clamp-2 text-muted-foreground">
        {description}
      </p>
    </Link>;
};