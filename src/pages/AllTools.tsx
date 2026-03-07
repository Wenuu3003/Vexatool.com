import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { toolsData, toolCategories } from "@/data/toolsData";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

const AllTools = () => {
  const canonicalUrl = useCanonicalUrl();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTools = useMemo(() => {
    let tools = toolsData;
    if (activeCategory !== "all") {
      tools = tools.filter((t) => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.seoKeywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return tools;
  }, [searchQuery, activeCategory]);

  return (
    <>
      <Helmet>
        <title>All Free Online Tools – 50+ PDF, Image, Calculator Tools | VexaTool</title>
        <meta
          name="description"
          content="Browse 50+ free online tools: PDF editor, image compressor, QR code generator, calculators, document converters and more. No signup, 100% secure."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="All Free Online Tools – VexaTool" />
        <meta property="og:description" content="Browse 50+ free online tools for PDF, images, calculators and more." />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4 max-w-5xl text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                All Free Online Tools
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Browse our complete collection of 50+ free tools. No signup required, 100% secure browser-based processing.
              </p>

              {/* Search */}
              <div className="max-w-md mx-auto mb-8 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  All ({toolsData.length})
                </button>
                {toolCategories.map((cat) => {
                  const count = toolsData.filter((t) => t.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        activeCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {cat.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Tools Grid */}
          <section className="pb-20" style={{ backgroundColor: "#f8fafc" }}>
            <div className="container mx-auto px-4 max-w-6xl py-12">
              {filteredTools.length === 0 ? (
                <p className="text-center text-muted-foreground text-lg py-12">
                  No tools found matching "{searchQuery}". Try a different search term.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.id}
                        to={tool.href}
                        className={cn(
                          "group flex flex-col items-center text-center p-5 rounded-xl bg-white border border-border/60",
                          "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]",
                          "hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5"
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                            tool.colorClass
                          )}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1 leading-tight">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                          {tool.shortDescription}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-medium text-primary",
                            "px-3 py-1.5 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors"
                          )}
                        >
                          Open Tool
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AllTools;
