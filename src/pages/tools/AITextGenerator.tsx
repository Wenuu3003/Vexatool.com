import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "creative", label: "Creative" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
];

const contentTypes = [
  { value: "blog", label: "Blog Post" },
  { value: "social", label: "Social Media Post" },
  { value: "email", label: "Email" },
  { value: "product", label: "Product Description" },
  { value: "story", label: "Story/Creative Writing" },
];

export default function AITextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [contentType, setContentType] = useState("blog");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a topic or prompt to generate text.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedText("");

    try {
      const systemPrompt = `You are a professional content writer. Generate ${contentType} content with a ${tone} tone. Be creative, engaging, and provide high-quality content. Format the output nicely with paragraphs.`;
      
      const response = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Write about: ${prompt}` },
          ],
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      if (data?.content) {
        setGeneratedText(data.content);
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

  const handleCopy = async () => {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    toast({ title: "Copied!", description: "Text copied to clipboard." });
  };

  return (
    <ToolLayout
      title="AI Text Generator"
      description="Generate high-quality content with AI. Create blog posts, social media content, emails, and more."
      icon={Sparkles}
      colorClass="bg-gradient-to-br from-violet-500 to-purple-600"
      category="AI Tools"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="content-type">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger id="content-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone">Writing Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Topic or Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Enter your topic, idea, or detailed prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
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
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Content
            </>
          )}
        </Button>

        {generatedText && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Generated Content</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap text-sm leading-relaxed">
              {generatedText}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
