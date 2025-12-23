import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tags, Copy, RefreshCw, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

const TagsGenerator = () => {
  const [input, setInput] = useState("");
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const commonWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall", "can", "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they"];

  const generateTags = () => {
    if (!input.trim()) {
      toast.error("Please enter some text or keywords");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const words = input
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !commonWords.includes(word));

      const uniqueWords = [...new Set(words)];
      
      const tags = uniqueWords.slice(0, 20).map((word) => {
        if (Math.random() > 0.7) {
          return `#${word}`;
        }
        return word;
      });

      // Add some combined tags
      if (uniqueWords.length >= 2) {
        const combined = `${uniqueWords[0]}${uniqueWords[1]}`;
        tags.push(`#${combined}`);
      }

      setGeneratedTags(tags);
      setIsGenerating(false);
      toast.success(`Generated ${tags.length} tags`);
    }, 500);
  };

  const copyTags = () => {
    const tagString = generatedTags.join(", ");
    navigator.clipboard.writeText(tagString);
    toast.success("Tags copied to clipboard");
  };

  const copyTagsWithHashtags = () => {
    const tagString = generatedTags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
    navigator.clipboard.writeText(tagString);
    toast.success("Hashtags copied to clipboard");
  };

  const removeTag = (index: number) => {
    setGeneratedTags((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setGeneratedTags([]);
    setInput("");
  };

  return (
    <>
      <Helmet>
        <title>Tags Generator Free Online - Hashtag Generator | Mypdfs</title>
        <meta name="description" content="Free tags and hashtag generator. Generate relevant tags for SEO, social media, and content. Improve your reach with smart tagging." />
        <meta name="keywords" content="tags generator, hashtag generator, SEO tags, social media tags, keyword generator, free tag maker" />
        <link rel="canonical" href="https://mypdfs.lovable.app/tags-generator" />
      </Helmet>
      <ToolLayout
        title="Tags Generator"
        description="Generate relevant tags and hashtags for your content, social media, and SEO"
        icon={Tags}
        colorClass="bg-pink-500"
      >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Enter your content or keywords
          </label>
          <Textarea
            placeholder="Enter text, topic, or keywords to generate relevant tags..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-32 mb-4"
          />
          <div className="flex gap-2">
            <Button onClick={generateTags} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Tags
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear
            </Button>
          </div>
        </div>

        {generatedTags.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                Generated Tags ({generatedTags.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyTags}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={copyTagsWithHashtags}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy as #
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {generatedTags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors group"
                  onClick={() => removeTag(index)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2">Tips for better tags:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use specific keywords related to your content</li>
            <li>• Include trending topics when relevant</li>
            <li>• Mix broad and niche tags for better reach</li>
            <li>• Keep hashtags short and memorable</li>
          </ul>
        </div>
      </div>
      </ToolLayout>
    </>
  );
};

export default TagsGenerator;
