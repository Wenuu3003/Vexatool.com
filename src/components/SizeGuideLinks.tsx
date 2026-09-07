import { Link } from "react-router-dom";
import type { SizeGuideGroup } from "@/data/sizeGuideLinks";

interface SizeGuideLinksProps {
  groups: SizeGuideGroup[];
  className?: string;
}

/**
 * Contextual internal-link section for the programmatic size/photo guide
 * pages. Uses the same card styling as the existing tool grids so it blends
 * into the current design without introducing new visual patterns.
 */
export const SizeGuideLinks = ({ groups, className = "" }: SizeGuideLinksProps) => {
  if (!groups.length) return null;

  return (
    <div className={`container mx-auto px-4 max-w-5xl ${className}`}>
      {groups.map((group) => (
        <section key={group.id} className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-2">{group.heading}</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-3xl">{group.intro}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="block h-full p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200"
                >
                  <span className="block font-medium text-foreground mb-1">{link.label}</span>
                  <span className="block text-sm text-muted-foreground leading-relaxed">{link.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default SizeGuideLinks;
