import { useState } from "react";
import { CanonicalHead } from "@/components/CanonicalHead";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Youtube, Copy, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ToolSEOContent from "@/components/ToolSEOContent";

const categories = [
  { value: "tutorial", label: "Tutorial / How-To" },
  { value: "vlog", label: "Vlog" },
  { value: "review", label: "Review" },
  { value: "entertainment", label: "Entertainment" },
  { value: "educational", label: "Educational" },
  { value: "gaming", label: "Gaming" },
  { value: "tech", label: "Tech" },
  { value: "lifestyle", label: "Lifestyle" },
];

interface GeneratedContent {
  titles: string[];
  description: string;
  tags: string[];
}

export default function YouTubeGenerator() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("tutorial");
  const [keywords, setKeywords] = useState("");
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a video topic.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGenerated(null);

    try {
      const systemPrompt = `You are a YouTube SEO expert. Generate optimized content for a ${category} video.
      
      Respond in this exact JSON format:
      {
        "titles": ["title1", "title2", "title3", "title4", "title5"],
        "description": "full SEO-optimized description with timestamps section and call-to-action",
        "tags": ["tag1", "tag2", "tag3", ...]
      }
      
      Requirements:
      - 5 catchy, clickable titles (60 chars max each)
      - Description: 1500+ chars, include keywords naturally, add sections with emojis
      - 15-20 relevant tags
      - Focus on SEO and discoverability`;

      const response = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Topic: ${topic}${keywords ? `\nKeywords: ${keywords}` : ""}` },
          ],
        },
      });

      if (response.error) throw new Error(response.error.message || "Request failed");

      const data = response.data;
      if (data?.response) {
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setGenerated(parsed);
          } else {
            throw new Error("Could not parse response");
          }
        } catch {
          toast({
            title: "Parse error",
            description: "Could not parse generated content. Please try again.",
            variant: "destructive",
          });
        }
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

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const seoContent = {
    toolName: "YouTube Title & Description Generator",
    whatIs: "YouTube Title & Description Generator is an AI-powered tool designed to help content creators optimize their videos for search and discovery. It generates SEO-friendly titles, comprehensive descriptions with timestamps and calls-to-action, and relevant tags that help your videos rank higher in YouTube search results. Perfect for YouTubers, marketers, and anyone looking to maximize their video's visibility and click-through rate.",
    howToUse: [
      "Enter your video topic in the 'Video Topic' field.",
      "Select the appropriate content category (Tutorial, Vlog, Review, etc.).",
      "Optionally add target keywords for better SEO focus.",
      "Click 'Generate Content' to create optimized titles, description, and tags.",
      "Copy individual elements or click 'Regenerate' for new variations."
    ],
    features: [
      "5 catchy, click-worthy title options optimized for 60 characters.",
      "Full SEO-optimized descriptions with timestamps and CTAs (1500+ characters).",
      "15-20 relevant tags for video discoverability.",
      "Support for multiple content categories: Tutorial, Vlog, Review, Entertainment, Educational, Gaming, Tech, Lifestyle.",
      "One-click copy functionality for titles, description, and tags.",
      "Regenerate feature for alternative content options."
    ],
    safetyNote: "Generated content is AI-created and should be reviewed and customized to match your specific video content. Ensure all titles and descriptions accurately represent your video to maintain viewer trust and comply with YouTube's guidelines against misleading metadata.",
    faqs: [
      {
        question: "Why are YouTube titles important for SEO?",
        answer: "Titles are the first thing viewers and YouTube's algorithm see. A good title includes your main keyword, is under 60 characters (to avoid truncation), and is compelling enough to encourage clicks. The generated titles are optimized for all these factors."
      },
      {
        question: "How long should my YouTube description be?",
        answer: "YouTube allows up to 5,000 characters. For best SEO, aim for at least 250 words with your main keywords in the first 2-3 sentences. The generator creates descriptions of 1500+ characters with proper structure including timestamps and calls-to-action."
      },
      {
        question: "Do YouTube tags still matter?",
        answer: "While not as important as titles and descriptions, tags still help YouTube understand your content and can improve discoverability for misspellings and related searches. Use a mix of broad and specific tags as generated by this tool."
      },
      {
        question: "Should I add my own keywords?",
        answer: "Yes, adding target keywords helps the AI generate more focused content. Include terms your audience searches for, competitor video keywords, and any specific phrases you want to rank for."
      }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="YouTube Title & Description Generator Free Online | MyPDFs"
        description="Free AI YouTube title and description generator. Create SEO-optimized titles, descriptions, and tags."
        keywords="YouTube title generator, YouTube description generator, YouTube SEO, video SEO, YouTube tags"
      />
      <ToolLayout
        title="YouTube Title & Description Generator"
        description="Generate SEO-optimized YouTube titles, descriptions, and tags to boost your video's visibility and engagement."
        icon={Youtube}
        colorClass="bg-gradient-to-br from-red-500 to-red-600"
        category="Social Media Tools"
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topic">Video Topic *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to edit videos with DaVinci Resolve"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Target Keywords (optional)</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., video editing, beginner tutorial, free software"
            />
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
                <Youtube className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>

          {generated && (
            <div className="space-y-6">
              {/* Titles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Title Options</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generated.titles.join("\n"), "Titles")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                </div>
                <div className="space-y-2">
                  {generated.titles.map((title, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleCopy(title, "Title")}
                    >
                      <span className="text-sm font-medium">{title}</span>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Description</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generated.description, "Description")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={generated.description}
                  readOnly
                  className="min-h-[200px] text-sm"
                />
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Tags</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generated.tags.join(", "), "Tags")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generated.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleGenerate}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          )}

          <ToolSEOContent {...seoContent} />
        </div>
      </ToolLayout>
    </>
  );
}
