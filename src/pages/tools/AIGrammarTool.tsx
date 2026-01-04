import { useState } from "react";
import { Helmet } from "react-helmet";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SpellCheck, Copy, ArrowRightLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ToolSEOContent from "@/components/ToolSEOContent";

const modes = [
  { value: "grammar", label: "Fix Grammar & Spelling" },
  { value: "rewrite", label: "Rewrite / Paraphrase" },
  { value: "simplify", label: "Simplify Language" },
  { value: "formal", label: "Make Formal" },
  { value: "casual", label: "Make Casual" },
  { value: "expand", label: "Expand Content" },
  { value: "summarize", label: "Summarize" },
];

export default function AIGrammarTool() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("grammar");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getModePrompt = (selectedMode: string) => {
    switch (selectedMode) {
      case "grammar":
        return "Fix all grammar, spelling, and punctuation errors. Keep the original meaning and style intact.";
      case "rewrite":
        return "Rewrite and paraphrase the text while preserving the original meaning. Make it fresh and engaging.";
      case "simplify":
        return "Simplify the language to make it easier to understand. Use shorter sentences and simpler words.";
      case "formal":
        return "Rewrite the text in a formal, professional tone suitable for business communication.";
      case "casual":
        return "Rewrite the text in a casual, friendly tone suitable for informal communication.";
      case "expand":
        return "Expand the content with more details, examples, and explanations while keeping the core message.";
      case "summarize":
        return "Summarize the text concisely, keeping only the key points and main ideas.";
      default:
        return "Fix all grammar and spelling errors.";
    }
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text to process.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setOutputText("");

    try {
      const systemPrompt = `You are a professional editor and writing assistant. ${getModePrompt(mode)} Only output the processed text without any explanations or comments.`;
      
      const response = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: inputText },
          ],
        },
      });

      if (response.error) throw new Error(response.error.message || "Request failed");

      const data = response.data;
      if (data?.response) {
        setOutputText(data.response);
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No response received");
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    toast({ title: "Copied!", description: "Text copied to clipboard." });
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText("");
  };

  const seoContent = {
    toolName: "AI Grammar & Rewrite Tool",
    whatIs: "AI Grammar & Rewrite Tool is an intelligent writing assistant that helps you fix grammar errors, spelling mistakes, and punctuation issues. It can also rewrite, paraphrase, simplify, or change the tone of your text. Using advanced AI technology, this tool understands context and provides natural-sounding corrections and rewrites while preserving your original meaning. Perfect for students, professionals, content creators, and anyone who wants polished, error-free writing.",
    howToUse: [
      "Select your desired mode: Fix Grammar, Rewrite, Simplify, Make Formal, Make Casual, Expand, or Summarize.",
      "Paste or type your text in the Original Text field.",
      "Click the 'Process Text' button to let the AI analyze and process your text.",
      "Review the processed text in the output area.",
      "Click 'Copy' to copy the result or 'Use as Input' to continue refining."
    ],
    features: [
      "Multiple processing modes: grammar fix, rewrite, simplify, formalize, casualize, expand, and summarize.",
      "Real-time word and character count for both input and output.",
      "One-click copy processed text to clipboard.",
      "Swap feature to use output as new input for iterative refinement.",
      "Context-aware AI that maintains your original meaning.",
      "Works with any type of text: emails, essays, articles, messages, and more."
    ],
    safetyNote: "Your text is processed through secure AI services. While the tool produces excellent results, always review the output, especially for important documents. The AI suggestions should be considered as helpful recommendations rather than final edits.",
    faqs: [
      {
        question: "What's the difference between Rewrite and Simplify modes?",
        answer: "Rewrite mode paraphrases your text while keeping the same complexity level, making it sound fresh. Simplify mode specifically reduces complexity, using shorter sentences and simpler vocabulary while preserving the core meaning."
      },
      {
        question: "Can I process very long documents?",
        answer: "For best results, process text in sections rather than very long documents. This allows the AI to focus on each section and provide better quality corrections and rewrites."
      },
      {
        question: "Does the tool support languages other than English?",
        answer: "The tool is optimized for English text. While it may work with other languages to some degree, results are most accurate and natural for English content."
      },
      {
        question: "Will the AI change my writing style?",
        answer: "In Grammar Fix mode, the AI preserves your original style while correcting errors. Other modes like Formal or Casual will intentionally change the tone as requested. You can always use multiple passes to fine-tune the result."
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>AI Grammar Checker & Text Rewriter Free Online | MyPDFs</title>
        <meta name="description" content="Free AI grammar checker and text rewriter. Fix spelling, punctuation, and grammar errors. Paraphrase, simplify, or change tone of your writing instantly." />
        <meta name="keywords" content="grammar checker, AI grammar, text rewriter, paraphrase tool, fix grammar, spelling checker, free grammar tool" />
        <link rel="canonical" href="https://mypdfs.lovable.app/ai-grammar-tool" />
      </Helmet>
      <ToolLayout
        title="AI Grammar & Rewrite Tool"
        description="Fix grammar, spelling, and punctuation errors. Rewrite, paraphrase, simplify, or enhance your text with AI."
        icon={SpellCheck}
        colorClass="bg-gradient-to-br from-blue-500 to-cyan-500"
        category="AI Tools"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger id="mode" className="w-full md:w-[300px]">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {modes.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="input">Original Text</Label>
              <Textarea
                id="input"
                placeholder="Paste or type your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[250px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {inputText.length} characters · {inputText.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Processed Text</Label>
                {outputText && (
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                )}
              </div>
              <div className="min-h-[250px] rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {outputText || (
                  <span className="text-muted-foreground">
                    Processed text will appear here...
                  </span>
                )}
              </div>
              {outputText && (
                <p className="text-xs text-muted-foreground">
                  {outputText.length} characters · {outputText.trim().split(/\s+/).filter(Boolean).length} words
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleProcess}
              disabled={isLoading || !inputText.trim()}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <SpellCheck className="mr-2 h-4 w-4" />
                  Process Text
                </>
              )}
            </Button>
            {outputText && (
              <Button variant="outline" size="lg" onClick={handleSwap}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Use as Input
              </Button>
            )}
          </div>

          <ToolSEOContent {...seoContent} />
        </div>
      </ToolLayout>
    </>
  );
}
