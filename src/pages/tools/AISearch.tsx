import { useState } from "react";
import { Helmet } from "react-helmet";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, ExternalLink, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchResult {
  answer: string;
  citations: string[];
}

const AISearch = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("perplexity-search", {
        body: { query: query.trim() },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : "Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch(e as unknown as React.FormEvent);
    }
  };

  const suggestedQueries = [
    "What are the latest developments in AI?",
    "How does quantum computing work?",
    "Best practices for web development in 2024",
    "Explain climate change solutions",
  ];

  return (
    <>
      <Helmet>
        <title>AI Web Search - Real-time Search with Sources | Mypdfs</title>
        <meta
          name="description"
          content="Search the web with AI-powered answers and cited sources. Get accurate, real-time information with Perplexity-powered search."
        />
        <meta name="keywords" content="AI search, web search, Perplexity, cited sources, real-time search" />
        <link rel="canonical" href="https://mypdfs.lovable.app/ai-search" />
      </Helmet>
      
      <ToolLayout
        title="AI Web Search"
        description="Search the web with AI-powered answers backed by real sources"
        icon={Search}
        colorClass="bg-gradient-to-br from-violet-500 to-purple-600"
        category="SearchApplication"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ask anything..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-primary transition-colors"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                className="h-14 px-8 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Suggested Queries */}
          {!result && !isLoading && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQueries.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => {
                      setQuery(suggestion);
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Searching the web for answers...</p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && !isLoading && (
            <div className="space-y-4">
              {/* Answer Card */}
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">AI Answer</h3>
                      <p className="text-sm text-muted-foreground">Powered by Perplexity</p>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {result.answer}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Citations */}
              {result.citations && result.citations.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Sources ({result.citations.length})
                    </h4>
                    <div className="space-y-2">
                      {result.citations.map((citation, index) => (
                        <a
                          key={index}
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm group"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="truncate flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
                            {citation}
                          </span>
                          <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Search Again */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setQuery("");
                  }}
                >
                  Search Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </ToolLayout>
    </>
  );
};

export default AISearch;
