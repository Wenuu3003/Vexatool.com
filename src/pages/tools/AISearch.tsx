import { useState } from "react";
import { Link } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, ExternalLink, Sparkles, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import ToolSEOContent from "@/components/ToolSEOContent";
import { CanonicalHead } from "@/components/CanonicalHead";

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

  const seoContent = {
    toolName: "AI Web Search",
    whatIs: "AI Web Search is an intelligent search tool that provides comprehensive answers to your questions with cited sources. Unlike traditional search engines that just give you links, this AI-powered search understands your question and synthesizes information from multiple sources to provide a direct, well-organized answer. Each response includes citations so you can verify information and explore topics further.",
    howToUse: [
      "Log in to your account to access AI Web Search.",
      "Enter your question or search query in the search box.",
      "Press Enter or click the Search button.",
      "Read the AI-generated answer that synthesizes information from multiple sources.",
      "Click on citations to explore the original sources for more details."
    ],
    features: [
      "AI-powered answers that synthesize information from multiple sources.",
      "Cited sources for transparency and verification.",
      "Real-time web search for up-to-date information.",
      "Natural language understanding for complex questions.",
      "Clean, organized response format.",
      "Suggested queries to help you get started."
    ],
    safetyNote: "AI Web Search provides synthesized answers from web sources. While sources are cited for verification, always double-check important information from official or primary sources. The AI aims for accuracy but may occasionally make mistakes.",
    faqs: [
      {
        question: "How is this different from regular search engines?",
        answer: "Traditional search engines provide a list of links. AI Web Search actually reads and synthesizes content from multiple sources to provide a direct answer to your question, saving you time and giving you comprehensive information in one place."
      },
      {
        question: "Why are citations important?",
        answer: "Citations let you verify the information and explore topics in depth. They also provide transparency about where the AI got its information, helping you assess the reliability of the answer."
      },
      {
        question: "Can I search for anything?",
        answer: "You can search for factual information, explanations, how-to guides, and general knowledge questions. The AI is designed to provide helpful, accurate information while avoiding harmful or inappropriate content."
      },
      {
        question: "Why do I need to log in?",
        answer: "Login helps us manage usage, prevent abuse, and provide a better experience. It also allows us to maintain the quality and availability of the service for all users."
      }
    ]
  };

  // Show login prompt if not authenticated
  if (!loading && !user) {
    return (
      <>
        <CanonicalHead
          title="AI Web Search Free Online - Real-time Search with Sources | VexaTool"
          description="Search the web with AI-powered answers and cited sources. Get accurate, real-time information."
          keywords="AI search, web search, cited sources, real-time search, AI answers"
        />
        
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
            <ToolSEOContent {...seoContent} />
          </div>
        </ToolLayout>
      </>
    );
  }

  return (
    <>
      <CanonicalHead
        title="AI Web Search Free Online - Real-time Search with Sources | VexaTool"
        description="Search the web with AI-powered answers and cited sources. Get accurate, real-time information."
        keywords="AI search, web search, cited sources, real-time search, AI answers"
      />
      
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

          <ToolSEOContent {...seoContent} />
        </div>
      </ToolLayout>
    </>
  );
};

export default AISearch;
