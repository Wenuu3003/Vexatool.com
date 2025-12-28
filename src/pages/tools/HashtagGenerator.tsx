import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Hash, Copy, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

      if (response.error) throw response.error;

      const data = response.data;
      if (data?.content) {
        const generated = data.content
          .split("\n")
          .map((h: string) => h.trim())
          .filter((h: string) => h.startsWith("#"));
        setHashtags(generated);
      } else if (data?.error) {
        throw new Error(data.error);
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

  return (
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
      </div>
    </ToolLayout>
  );
}
