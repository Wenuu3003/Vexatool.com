import { useState } from "react";
import { Helmet } from "react-helmet";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Hash, Copy, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ToolSEOContent from "@/components/ToolSEOContent";

const platforms = [
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter/X" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
];

export default function HashtagGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic or keyword.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHashtags([]);

    try {
      const systemPrompt = `You are a social media expert. Generate 20-30 relevant, trending hashtags for ${platform}. 
      Include a mix of:
      - High-volume popular hashtags
      - Medium-competition hashtags
      - Niche/specific hashtags
      
      Output ONLY the hashtags, one per line, starting with #. No explanations or categories.`;

      const response = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate hashtags for: ${topic}` },
          ],
        },
      });

      if (response.error) throw new Error(response.error.message || "Request failed");

      const data = response.data;
      if (data?.response) {
        const generated = data.response
          .split("\n")
          .map((h: string) => h.trim())
          .filter((h: string) => h.startsWith("#"));
        setHashtags(generated);
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No response received");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (!hashtags.length) return;
    await navigator.clipboard.writeText(hashtags.join(" "));
    toast({ title: "Copied!", description: "All hashtags copied to clipboard." });
  };

  const handleCopyOne = async (tag: string) => {
    await navigator.clipboard.writeText(tag);
    toast({ title: "Copied!", description: `${tag} copied to clipboard.` });
  };

  const seoContent = {
    toolName: "Hashtag Generator",
    whatIs: "Hashtag Generator is an AI-powered tool that creates relevant, trending hashtags for your social media posts. Simply enter your topic or keywords and select your target platform (Instagram, Twitter/X, TikTok, LinkedIn, or YouTube), and the AI will generate a curated mix of popular, medium-competition, and niche hashtags to maximize your content's reach and engagement. Perfect for content creators, marketers, and anyone looking to boost their social media presence.",
    howToUse: [
      "Enter your topic or keywords in the input field (e.g., 'fitness', 'travel photography').",
      "Select your target social media platform from the dropdown.",
      "Click 'Generate Hashtags' to create your hashtag list.",
      "Click individual hashtags to copy them, or use 'Copy All' for the complete set.",
      "Click 'Regenerate' to get a fresh set of hashtags if needed."
    ],
    features: [
      "AI-powered hashtag generation tailored to specific platforms.",
      "Mix of high-volume, medium-competition, and niche hashtags.",
      "Support for Instagram, Twitter/X, TikTok, LinkedIn, and YouTube.",
      "One-click copy for individual hashtags or all at once.",
      "Regenerate feature for alternative hashtag options.",
      "20-30 relevant hashtags per generation."
    ],
    safetyNote: "Generated hashtags are based on AI analysis and should be reviewed for relevance to your specific content. Avoid using banned or inappropriate hashtags on your target platform. Always check that hashtags align with your brand and content guidelines.",
    faqs: [
      {
        question: "How many hashtags should I use on Instagram?",
        answer: "Instagram allows up to 30 hashtags per post. Research suggests 9-11 highly relevant hashtags often perform best, but you can experiment with different numbers to find what works for your account."
      },
      {
        question: "Why are platform-specific hashtags important?",
        answer: "Each platform has different hashtag cultures and best practices. LinkedIn hashtags tend to be more professional, while TikTok hashtags often include trending sounds and challenges. Platform-specific generation ensures more effective results."
      },
      {
        question: "Should I use the same hashtags for every post?",
        answer: "No, it's best to vary your hashtags. Using the same hashtags repeatedly can reduce reach. Use this tool to generate fresh hashtags for each post based on its specific content."
      },
      {
        question: "How do I know which hashtags to remove?",
        answer: "Remove hashtags that aren't directly relevant to your content, have very low usage (won't help discovery), or seem spammy. Focus on hashtags that your target audience would actually search for or follow."
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Hashtag Generator Free Online - Social Media Hashtags | MyPDFs</title>
        <meta name="description" content="Free AI hashtag generator for Instagram, TikTok, Twitter, LinkedIn, and YouTube. Generate trending and relevant hashtags to boost your social media reach." />
        <meta name="keywords" content="hashtag generator, Instagram hashtags, TikTok hashtags, Twitter hashtags, social media hashtags, free hashtag tool" />
        <link rel="canonical" href="https://mypdfs.in/hashtag-generator" />
      </Helmet>
      <ToolLayout
        title="Hashtag Generator"
        description="Generate trending and relevant hashtags for your social media posts. Boost your reach on Instagram, TikTok, Twitter, and more."
        icon={Hash}
        colorClass="bg-gradient-to-br from-pink-500 to-rose-600"
        category="Social Media Tools"
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Keywords</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., fitness, travel, food photography"
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Hash className="mr-2 h-4 w-4" />
                Generate Hashtags
              </>
            )}
          </Button>

          {hashtags.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {hashtags.length} hashtags generated
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyAll}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleCopyOne(tag)}
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ToolSEOContent {...seoContent} />
        </div>
      </ToolLayout>
    </>
  );
}
