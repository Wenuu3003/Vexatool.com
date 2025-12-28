import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WordCounter() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    
    // Characters
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    
    // Words
    const words = trimmedText ? trimmedText.split(/\s+/).filter(Boolean).length : 0;
    
    // Sentences (split by . ! ?)
    const sentences = trimmedText ? trimmedText.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
    
    // Paragraphs
    const paragraphs = trimmedText ? trimmedText.split(/\n\n+/).filter((p) => p.trim()).length : 0;
    
    // Lines
    const lines = text.split("\n").length;
    
    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);
    
    // Speaking time (average 150 words per minute)
    const speakingTime = Math.ceil(words / 150);
    
    // Average word length
    const avgWordLength = words > 0 ? (charactersNoSpaces / words).toFixed(1) : "0";
    
    // Longest word
    const allWords = trimmedText.split(/\s+/).filter(Boolean);
    const longestWord = allWords.reduce((longest, word) => 
      word.length > longest.length ? word : longest, "");
    
    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime,
      avgWordLength,
      longestWord,
    };
  }, [text]);

  const handleCopy = async () => {
    const statsText = `
Word Count Statistics:
- Characters: ${stats.characters}
- Characters (no spaces): ${stats.charactersNoSpaces}
- Words: ${stats.words}
- Sentences: ${stats.sentences}
- Paragraphs: ${stats.paragraphs}
- Reading Time: ~${stats.readingTime} min
- Speaking Time: ~${stats.speakingTime} min
    `.trim();
    
    await navigator.clipboard.writeText(statsText);
    toast({ title: "Copied!", description: "Statistics copied to clipboard." });
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <ToolLayout
      title="Word Counter"
      description="Count words, characters, sentences, and paragraphs. Get reading time and writing statistics."
      icon={FileText}
      colorClass="bg-gradient-to-br from-sky-500 to-blue-600"
      category="Writing Tools"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg bg-primary/10 p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.words}</p>
            <p className="text-sm text-muted-foreground">Words</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-3xl font-bold">{stats.characters}</p>
            <p className="text-sm text-muted-foreground">Characters</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-3xl font-bold">{stats.sentences}</p>
            <p className="text-sm text-muted-foreground">Sentences</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-3xl font-bold">{stats.paragraphs}</p>
            <p className="text-sm text-muted-foreground">Paragraphs</p>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="text">Enter or paste your text</Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!text}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Stats
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear} disabled={!text}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here..."
            className="min-h-[250px] resize-none text-base"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-semibold">Character Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">With spaces</span>
                <span className="font-medium">{stats.characters.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Without spaces</span>
                <span className="font-medium">{stats.charactersNoSpaces.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lines</span>
                <span className="font-medium">{stats.lines}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-semibold">Reading & Speaking Time</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">📖 Reading time</span>
                <span className="font-medium">~{stats.readingTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">🎤 Speaking time</span>
                <span className="font-medium">~{stats.speakingTime} min</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-semibold">Word Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average word length</span>
                <span className="font-medium">{stats.avgWordLength} chars</span>
              </div>
              {stats.longestWord && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longest word</span>
                  <span className="font-medium truncate max-w-[150px]">{stats.longestWord}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <h4 className="font-semibold">Platform Limits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Twitter/X</span>
                <span className={`font-medium ${stats.characters > 280 ? "text-red-500" : "text-green-500"}`}>
                  {stats.characters}/280
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Instagram Caption</span>
                <span className={`font-medium ${stats.characters > 2200 ? "text-red-500" : "text-green-500"}`}>
                  {stats.characters}/2200
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">LinkedIn Post</span>
                <span className={`font-medium ${stats.characters > 3000 ? "text-red-500" : "text-green-500"}`}>
                  {stats.characters}/3000
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
