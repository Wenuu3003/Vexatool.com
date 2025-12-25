import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, ExternalLink, Sparkles, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface SearchResult {
  answer: string;
  citations: string[];
}

const MAX_QUERY_LENGTH = 2000;

const AISearch = () => {
  const { user, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      toast.error("Please enter a search query");
      return;
    }

    if (trimmedQuery.length > MAX_QUERY_LENGTH) {
      toast.error(`Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`);
      return;
    }

    if (!user) {
      toast.error("Please log in to use AI Search");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("perplexity-search", {
        body: { query: trimmedQuery },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Search error:", error);
      }
      const errorMessage = error instanceof Error 
        ? error.message.includes("Failed to fetch")
          ? "Network error. Please refresh and try again."
          : error.message
        : "Search failed. Please try again.";
      
      if (errorMessage.includes("Authentication")) {
        toast.error("Please log in to use AI Search");
      } else {
        toast.error(errorMessage);
      }
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

  // Show login prompt if not authenticated
  if (!loading && !user) {
    return (
      <>
        <Helmet>
          <title>AI Web Search - Real-time Search with Sources | Mypdfs</title>
          <meta
            name="description"
            content="Search the web with AI-powered answers and cited sources. Get accurate, real-time information with Perplexity-powered search."
          />
        </Helmet>
        
        <ToolLayout
          title="AI Web Search"
          description="Search the web with AI-powered answers backed by real sources"
          icon={Search}
          colorClass="bg-gradient-to-br from-violet-500 to-purple-600"
          category="SearchApplication"
        >
          <div className="max-w-2xl mx-auto">
            <Card className="border-2">
              <CardContent className="pt-8 pb-8 text-center space-y-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 w-fit mx-auto">
                  <LogIn className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Login Required</h3>
                  <p className="text-muted-foreground">
                    Please log in to use the AI Web Search feature. This helps us provide a better experience and manage usage.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/auth">
                    <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                      <LogIn className="h-4 w-4 mr-2" />
                      Log In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </ToolLayout>
      </>
    );
  }

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
