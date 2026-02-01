import { useState, useMemo } from "react";
import { Search, Filter, Grid3X3, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolPreviewCard } from "./ToolPreviewCard";
import { toolsData, toolCategories, searchTools } from "@/data/toolsData";
import { cn } from "@/lib/utils";
interface ToolsGalleryProps {
  showSearch?: boolean;
  showFilters?: boolean;
  maxItems?: number;
  gridColumns?: "3" | "4";
}
export const ToolsGallery = ({
  showSearch = true,
  showFilters = true,
  maxItems,
  gridColumns = "4"
}: ToolsGalleryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  // Filter and search tools
  const filteredTools = useMemo(() => {
    let result = toolsData;

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(tool => tool.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      result = searchTools(searchQuery);
      if (selectedCategory) {
        result = result.filter(tool => tool.category === selectedCategory);
      }
    }

    // Apply max items limit
    if (maxItems) {
      result = result.slice(0, maxItems);
    }
    return result;
  }, [searchQuery, selectedCategory, maxItems]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    return toolCategories.reduce((acc, cat) => {
      acc[cat.id] = toolsData.filter(tool => tool.category === cat.id).length;
      return acc;
    }, {} as Record<string, number>);
  }, []);
  return <section id="tools-gallery" className="py-12 md:py-20 bg-background" aria-labelledby="gallery-heading" itemScope itemType="https://schema.org/ItemList">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 id="gallery-heading" className="text-3xl md:text-4xl font-bold mb-4 text-foreground bg-muted-foreground" itemProp="name">
            All Free Online Tools
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground" itemProp="description">
            Choose from our collection of {toolsData.length}+ free tools for PDF editing, image processing, AI assistance, and more.
          </p>
        </div>

        {/* Search and Filters */}
        {(showSearch || showFilters) && <div className="mb-8 space-y-4">
            {/* Search Bar */}
            {showSearch && <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="search" placeholder="Search tools by name or feature..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12 pr-4 py-3 h-12 text-base rounded-xl border-border bg-card" aria-label="Search tools" />
              </div>}

            {/* Category Filters and View Toggle */}
            {showFilters && <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Category Pills */}
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                  <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)} className="rounded-full">
                    All Tools
                    <Badge variant="secondary" className="ml-2 bg-white/20">
                      {toolsData.length}
                    </Badge>
                  </Button>
                  {toolCategories.map(category => {
              const CategoryIcon = category.icon;
              return <Button key={category.id} variant={selectedCategory === category.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category.id)} className="rounded-full gap-2">
                        <CategoryIcon className="w-4 h-4" />
                        {category.name}
                        <Badge variant="secondary" className="ml-1 bg-white/20 text-xs">
                          {categoryCounts[category.id]}
                        </Badge>
                      </Button>;
            })}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="rounded-md" aria-label="Grid view">
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === "compact" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("compact")} className="rounded-md" aria-label="Compact view">
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>}
          </div>}

        {/* Results Count */}
        {searchQuery && <p className="text-sm text-muted-foreground mb-6">
            Found {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} matching "{searchQuery}"
          </p>}

        {/* Tools Grid */}
        <div className={cn("grid gap-5", viewMode === "grid" ? gridColumns === "4" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6")} role="list" aria-label="Tools gallery">
          {filteredTools.map((tool, index) => <ToolPreviewCard key={tool.id} tool={tool} index={index} showPreview={viewMode === "grid"} />)}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && <div className="text-center py-16">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={() => {
          setSearchQuery("");
          setSelectedCategory(null);
        }}>
              Clear filters
            </Button>
          </div>}

        {/* Schema.org metadata */}
        <meta itemProp="numberOfItems" content={String(filteredTools.length)} />
      </div>
    </section>;
};