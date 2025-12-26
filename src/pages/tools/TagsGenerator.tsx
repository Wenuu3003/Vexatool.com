import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tags, Copy, RefreshCw, Sparkles, X, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";

const TagsGenerator = () => {
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState("general");
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const generateTags = async () => {
    if (!input.trim()) {
      toast.error("Please enter some text or keywords");
      return;
    }

    if (!user) {
      toast.error("Please sign in to generate tags");
      return;
    }

    setIsGenerating(true);
    setGeneratedTags([]);
    setCategories([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-tags", {
        body: { content: input.trim(), platform }
      });

      if (error) {
        if (error.message?.includes("401") || error.message?.includes("Authentication")) {
          toast.error("Please sign in to use this feature");
          return;
        }
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.tags && Array.isArray(data.tags)) {
        setGeneratedTags(data.tags);
        setCategories(data.categories || []);
        toast.success(`Generated ${data.tags.length} AI-powered tags!`);
      } else {
        toast.error("Failed to generate tags. Please try again.");
      }
    } catch (error) {
      console.error("Error generating tags:", error);
      toast.error("Failed to generate tags. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyTags = () => {
    const tagString = generatedTags.join(", ");
    navigator.clipboard.writeText(tagString);
    toast.success("Tags copied to clipboard");
  };

  const copyTagsWithHashtags = () => {
    const tagString = generatedTags.map((t) => `#${t.replace(/^#/, "")}`).join(" ");
    navigator.clipboard.writeText(tagString);
    toast.success("Hashtags copied to clipboard");
  };

  const removeTag = (index: number) => {
    setGeneratedTags((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setGeneratedTags([]);
    setCategories([]);
    setInput("");
  };

  return (
    <>
      <Helmet>
        <title>AI Tags Generator Free Online - Hashtag Generator for SEO & Social Media | Mypdfs</title>
        <meta name="description" content="Free AI-powered tags and hashtag generator. Generate relevant SEO tags for YouTube, Instagram, Twitter, and more. Boost your content reach with smart tagging." />
        <meta name="keywords" content="tags generator, hashtag generator, SEO tags, social media tags, keyword generator, free tag maker, YouTube tags, Instagram hashtags, AI tag generator" />
        <link rel="canonical" href="https://mypdfs.lovable.app/tags-generator" />
      </Helmet>
      <ToolLayout
        title="AI Tags Generator"
        description="Generate relevant AI-powered tags and hashtags for your content, social media, and SEO"
        icon={Tags}
        colorClass="bg-pink-500"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="content-input" className="block text-sm font-medium text-foreground mb-2">
                  Enter your content or keywords
                </label>
                <Textarea
                  id="content-input"
                  placeholder="Enter text, topic, description, or keywords to generate relevant AI-powered tags..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                  aria-describedby="content-hint"
                />
                <p id="content-hint" className="text-xs text-muted-foreground mt-1">
                  Describe your content in detail for better tag suggestions
                </p>
              </div>
              
              <div>
                <label htmlFor="platform-select" className="block text-sm font-medium text-foreground mb-2">
                  Platform (optional)
                </label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform-select" className="w-full" aria-label="Select platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General / SEO</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter / X</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!user ? (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-muted-foreground mb-3">Sign in to generate AI-powered tags</p>
                  <Link to="/auth">
                    <Button>
                      <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
                      Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={generateTags} 
                    disabled={isGenerating} 
                    className="flex-1"
                    aria-busy={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                        Generate AI Tags
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearAll} aria-label="Clear all">
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="bg-muted/50 rounded-xl p-4">
              <h4 className="font-medium text-foreground mb-2">Detected Categories:</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {generatedTags.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  Generated Tags ({generatedTags.length})
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyTags} aria-label="Copy tags as comma separated">
                    <Copy className="w-4 h-4 mr-1" aria-hidden="true" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyTagsWithHashtags} aria-label="Copy as hashtags">
                    <Copy className="w-4 h-4 mr-1" aria-hidden="true" />
                    Copy as #
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Generated tags">
                {generatedTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors group"
                    onClick={() => removeTag(index)}
                    role="listitem"
                    aria-label={`Remove tag ${tag}`}
                  >
                    #{tag.replace(/^#/, "")}
                    <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100" aria-hidden="true" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-4">
            <h4 className="font-medium text-foreground mb-2">Tips for better tags:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Describe your content in detail for more relevant tags</li>
              <li>• Select the right platform for optimized suggestions</li>
              <li>• Mix broad and niche tags for better reach</li>
              <li>• Click on any tag to remove it from the list</li>
            </ul>
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default TagsGenerator;
