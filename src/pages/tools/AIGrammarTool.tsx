import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SpellCheck, Copy, ArrowRightLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  return (
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
      </div>
    </ToolLayout>
  );
}
