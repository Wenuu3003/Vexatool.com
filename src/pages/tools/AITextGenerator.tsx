import { useState } from "react";
import { Helmet } from "react-helmet";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ToolSEOContent from "@/components/ToolSEOContent";

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

      if (response.error) throw new Error(response.error.message || "Request failed");

      const data = response.data;
      if (data?.response) {
        setGeneratedText(data.response);
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

  const handleCopy = async () => {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    toast({ title: "Copied!", description: "Text copied to clipboard." });
  };

  const seoContent = {
    toolName: "AI Text Generator",
    whatIs: "AI Text Generator is a powerful content creation tool that generates high-quality text for various purposes. Whether you need blog posts, social media content, emails, product descriptions, or creative writing, this AI-powered tool delivers engaging and well-written content in seconds. Simply provide a topic or prompt, select your preferred content type and writing tone, and let the AI create polished content tailored to your needs.",
    howToUse: [
      "Select the content type: Blog Post, Social Media Post, Email, Product Description, or Story.",
      "Choose your preferred writing tone: Professional, Casual, Creative, Formal, or Friendly.",
      "Enter your topic or detailed prompt in the text field.",
      "Click 'Generate Content' to create your text.",
      "Copy the generated content or click 'Regenerate' for a different version."
    ],
    features: [
      "Multiple content types for different platforms and purposes.",
      "Five distinct writing tones to match your brand voice.",
      "AI-powered generation that creates unique, high-quality content.",
      "One-click copy and regenerate functionality.",
      "Flexible prompts accepting topics or detailed instructions.",
      "Fast generation for quick content needs."
    ],
    safetyNote: "Generated content is created by AI and should be reviewed before publishing. While the content is high-quality, you may want to add personal touches, verify facts, and ensure it aligns with your brand guidelines. The AI uses your prompts securely and doesn't store generated content.",
    faqs: [
      {
        question: "How detailed should my prompt be?",
        answer: "More detailed prompts typically produce better results. Include specific topics, key points you want covered, target audience, and any particular angle or perspective you want the content to take."
      },
      {
        question: "Can I edit the generated content?",
        answer: "Absolutely. The generated content serves as a strong starting point. You can copy it, make edits, add your unique perspective, and customize it to perfectly fit your needs."
      },
      {
        question: "Is the generated content unique?",
        answer: "Yes, each generation creates new, unique content based on your specific prompt. The AI doesn't copy existing content but generates fresh text each time."
      },
      {
        question: "What's the best tone for business content?",
        answer: "For business content, 'Professional' works well for formal communications, while 'Friendly' is great for approachable brand voices. 'Formal' is ideal for official documents or announcements."
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>AI Text Generator Free Online - Create Content Instantly | MyPDFs</title>
        <meta name="description" content="Free AI text generator for blog posts, social media, emails, and more. Create high-quality content with customizable tones. Fast and easy content creation." />
        <meta name="keywords" content="AI text generator, content generator, blog writer, AI writer, text creator, free AI content" />
        <link rel="canonical" href="https://mypdfs.lovable.app/ai-text-generator" />
      </Helmet>
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

          <ToolSEOContent {...seoContent} />
        </div>
      </ToolLayout>
    </>
  );
}
