import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
  containerSelector?: string;
}

export const TableOfContents = ({ 
  className = "",
  containerSelector = "main"
}: TableOfContentsProps) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Find all headings in the container
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const headings = container.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    headings.forEach((heading, index) => {
      // Generate ID if not present
      if (!heading.id) {
        heading.id = `heading-${index}-${heading.textContent?.toLowerCase().replace(/\s+/g, "-").slice(0, 30) || index}`;
      }
      
      items.push({
        id: heading.id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName.charAt(1))
      });
    });

    setTocItems(items);

    // Intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [containerSelector]);

  if (tocItems.length < 3) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <nav 
      aria-label="Table of contents"
      className={cn(
        "border border-border rounded-lg bg-card p-4",
        className
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 font-semibold text-foreground w-full justify-between md:cursor-default"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2">
          <List className="w-4 h-4" />
          Table of Contents
        </span>
        <span className="md:hidden text-muted-foreground text-sm">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </button>
      
      <ol 
        className={cn(
          "mt-3 space-y-2 text-sm",
          !isExpanded && "hidden md:block"
        )}
      >
        {tocItems.map((item, index) => (
          <li 
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            <button
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                "text-left hover:text-primary transition-colors w-full truncate",
                activeId === item.id 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground"
              )}
            >
              {index + 1}. {item.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};
