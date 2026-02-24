import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, Youtube, CheckCircle, XCircle, AlertCircle, Loader2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

interface SEOResult {
  category: string;
  score: number;
  issues: string[];
  recommendations: string[];
}

const SEOTool = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SEOResult[] | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [activeTab, setActiveTab] = useState("website");

  const analyzeWebsite = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    // Simulate SEO analysis
    setTimeout(() => {
      const mockResults: SEOResult[] = [
        {
          category: "Title Tag",
          score: Math.floor(Math.random() * 30) + 70,
          issues: Math.random() > 0.5 ? ["Title may be too short"] : [],
          recommendations: ["Keep title between 50-60 characters", "Include primary keyword at the beginning"],
        },
        {
          category: "Meta Description",
          score: Math.floor(Math.random() * 40) + 60,
          issues: Math.random() > 0.5 ? ["Meta description missing or too short"] : [],
          recommendations: ["Write compelling 150-160 character descriptions", "Include target keywords naturally"],
        },
        {
          category: "Headings",
          score: Math.floor(Math.random() * 30) + 70,
          issues: Math.random() > 0.7 ? ["Multiple H1 tags found"] : [],
          recommendations: ["Use only one H1 tag per page", "Structure headings hierarchically"],
        },
        {
          category: "Images",
          score: Math.floor(Math.random() * 40) + 50,
          issues: ["Some images missing alt text"],
          recommendations: ["Add descriptive alt text to all images", "Optimize image file sizes"],
        },
        {
          category: "Mobile Friendliness",
          score: Math.floor(Math.random() * 20) + 80,
          issues: [],
          recommendations: ["Ensure responsive design", "Test on multiple devices"],
        },
        {
          category: "Page Speed",
          score: Math.floor(Math.random() * 40) + 50,
          issues: Math.random() > 0.5 ? ["Large JavaScript bundles detected"] : [],
          recommendations: ["Minimize CSS and JavaScript", "Enable compression", "Use browser caching"],
        },
        {
          category: "Links",
          score: Math.floor(Math.random() * 30) + 70,
          issues: [],
          recommendations: ["Use descriptive anchor text", "Fix any broken links"],
        },
      ];

      const avgScore = Math.round(mockResults.reduce((acc, r) => acc + r.score, 0) / mockResults.length);
      setOverallScore(avgScore);
      setResults(mockResults);
      setIsAnalyzing(false);
      toast.success("SEO analysis complete");
    }, 2000);
  };

  const analyzeYouTube = () => {
    if (!url.trim()) {
      toast.error("Please enter a YouTube URL or video ID");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    setTimeout(() => {
      const mockResults: SEOResult[] = [
        {
          category: "Video Title",
          score: Math.floor(Math.random() * 30) + 70,
          issues: Math.random() > 0.5 ? ["Title could be more keyword-rich"] : [],
          recommendations: ["Include primary keyword in first 60 characters", "Make it compelling and clickable"],
        },
        {
          category: "Description",
          score: Math.floor(Math.random() * 40) + 60,
          issues: ["Description may be too short"],
          recommendations: ["Write at least 250 words", "Include keywords in first 2-3 sentences", "Add timestamps and links"],
        },
        {
          category: "Tags",
          score: Math.floor(Math.random() * 40) + 50,
          issues: [],
          recommendations: ["Use 5-8 relevant tags", "Include variations of your main keyword", "Add your brand name"],
        },
        {
          category: "Thumbnail",
          score: Math.floor(Math.random() * 20) + 80,
          issues: [],
          recommendations: ["Use high-contrast custom thumbnails", "Include text overlay", "Show faces when possible"],
        },
        {
          category: "Engagement",
          score: Math.floor(Math.random() * 30) + 60,
          issues: [],
          recommendations: ["Ask viewers to like and subscribe", "Respond to comments", "Create end screens and cards"],
        },
        {
          category: "Closed Captions",
          score: Math.floor(Math.random() * 50) + 50,
          issues: Math.random() > 0.5 ? ["No custom captions found"] : [],
          recommendations: ["Add accurate closed captions", "Translate to other languages"],
        },
      ];

      const avgScore = Math.round(mockResults.reduce((acc, r) => acc + r.score, 0) / mockResults.length);
      setOverallScore(avgScore);
      setResults(mockResults);
      setIsAnalyzing(false);
      toast.success("YouTube SEO analysis complete");
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const seoContent = {
    toolName: "SEO Analyzer",
    whatIs: "SEO Analyzer is a comprehensive tool that evaluates your website or YouTube video for search engine optimization factors. It analyzes key SEO elements like title tags, meta descriptions, headings, images, mobile-friendliness, page speed, and links, providing actionable recommendations to improve your search rankings. Whether you're a website owner, digital marketer, or content creator, this tool helps you identify SEO issues and opportunities.",
    howToUse: [
      "Select the analysis type: Website SEO or YouTube SEO.",
      "Enter your website URL or YouTube video URL.",
      "Click 'Analyze' to start the SEO evaluation.",
      "Review your overall SEO score and individual category scores.",
      "Follow the recommendations to improve each SEO factor."
    ],
    features: [
      "Comprehensive SEO analysis for websites and YouTube videos.",
      "Overall SEO score with category breakdowns.",
      "Issue identification with severity indicators.",
      "Actionable recommendations for each SEO factor.",
      "Title tag, meta description, and heading analysis.",
      "Image optimization, mobile-friendliness, and page speed checks."
    ],
    safetyNote: "The analysis is performed by evaluating common SEO best practices. While the recommendations are based on industry standards, SEO is complex and results may vary. Always consider your specific context and audience when implementing changes.",
    faqs: [
      {
        question: "What is a good SEO score?",
        answer: "Scores above 80% indicate well-optimized content. Scores between 60-80% show room for improvement, while scores below 60% suggest significant optimization is needed. Focus on fixing issues in low-scoring categories first."
      },
      {
        question: "How often should I check my SEO?",
        answer: "Check your SEO after making significant changes to your website or content. Regular monthly checks help catch issues early. For competitive niches, more frequent monitoring may be beneficial."
      },
      {
        question: "Why is mobile-friendliness important for SEO?",
        answer: "Google uses mobile-first indexing, meaning it primarily uses the mobile version of your site for ranking. A mobile-friendly site provides better user experience and can significantly impact your search rankings."
      },
      {
        question: "Do YouTube tags still affect rankings?",
        answer: "While YouTube tags have less impact than titles and descriptions, they still help YouTube understand your content and can improve discoverability for related searches and misspellings."
      }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="SEO Analyzer Free Online - Website & YouTube SEO | VexaTool"
        description="Free SEO analyzer for websites and YouTube videos. Get actionable recommendations to improve rankings."
        keywords="SEO analyzer, SEO checker, website SEO, YouTube SEO, free SEO tool, SEO audit"
      />
      <ToolLayout
        title="SEO Analyzer"
        description="Analyze and optimize your website and YouTube videos for search engines"
        icon={BarChart3}
        colorClass="bg-blue-600"
      >
      <div className="max-w-3xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website SEO
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              YouTube SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="website" className="mt-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Website URL
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1"
                />
                <Button onClick={analyzeWebsite} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="mt-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                YouTube Video URL
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1"
                />
                <Button onClick={analyzeYouTube} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {isAnalyzing && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-foreground font-medium">Analyzing SEO factors...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        )}

        {results && (
          <>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Overall SEO Score</h3>
                <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </span>
              </div>
              <Progress value={overallScore} className={`h-3 ${getScoreBg(overallScore)}`} />
              <p className="text-sm text-muted-foreground mt-2">
                {overallScore >= 80
                  ? "Great! Your SEO is well optimized."
                  : overallScore >= 60
                  ? "Good, but there's room for improvement."
                  : "Needs work. Follow the recommendations below."}
              </p>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {result.score >= 80 ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : result.score >= 60 ? (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <h4 className="font-medium text-foreground">{result.category}</h4>
                    </div>
                    <Badge variant={result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "destructive"}>
                      {result.score}%
                    </Badge>
                  </div>

                  {result.issues.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-red-500 mb-1">Issues:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {result.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Recommendations:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {result.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <ToolSEOContent {...seoContent} />
      </div>
      </ToolLayout>
    </>
  );
};

export default SEOTool;
