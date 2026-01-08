import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Heart, Users, Flame, Sparkles, Share2, AlertCircle, Loader2, Home, Briefcase, Drama, Languages, Download, Image } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import ToolSEOContent from "@/components/ToolSEOContent";
import html2canvas from "html2canvas";

type AnalysisMode = 'love' | 'friendship' | 'roast' | 'family' | 'work' | 'drama';
type Language = 'english' | 'telugu' | 'hindi' | 'telugu-english' | 'hindi-english';

interface AnalysisResult {
  personA: string;
  personB: string;
  stats: {
    totalMessages: number;
    personAMessages: number;
    personBMessages: number;
    whoTextsFirst: string;
    textsFirstPercentage: number;
  };
  analysis: {
    personAInterest: number;
    personBInterest: number;
    personAEmotionalTone: string;
    personBEmotionalTone: string;
    personAHiddenIntent: string;
    personBHiddenIntent: string;
    replySpeedVerdict: string;
    overallVibes: string;
    verdict: string;
    funFact: string;
    mode: AnalysisMode;
  };
}

const WhatsAppAnalyzer = () => {
  const [chatText, setChatText] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("love");
  const [language, setLanguage] = useState<Language>("telugu-english");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const sanitizeInput = (text: string): string => {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  const languageLabels: Record<Language, string> = {
    'english': 'English',
    'telugu': 'తెలుగు (Telugu)',
    'hindi': 'हिंदी (Hindi)',
    'telugu-english': 'Telugu + English Mix',
    'hindi-english': 'Hindi + English Mix'
  };

  const handleAnalyze = async () => {
    if (!chatText.trim()) {
      toast.error("Please paste your WhatsApp chat first!");
      return;
    }

    if (chatText.length < 100) {
      toast.error("Chat is too short. Paste a longer conversation for better analysis!");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const sanitizedChat = sanitizeInput(chatText);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-analyzer', {
        body: { chatText: sanitizedChat, mode, language }
      });

      if (error) {
        throw new Error(error.message || "Analysis failed");
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);
      toast.success("Analysis complete! 🎉");
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    
    const shareText = `🔥 WhatsApp Chat Truth Revealed!\n\n${result.analysis.verdict}\n\nVibes: ${result.analysis.overallVibes} ✨\n\nAnalyze yours at mypdfs.in/whatsapp-analyzer`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "WhatsApp Chat Analysis",
          text: shareText,
        });
      } catch {
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard! Share it now 📤");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard! Share it now 📤");
    }
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current || !result) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `whatsapp-analysis-${result.personA}-${result.personB}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("Image downloaded! Share it on social media 📸");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image. Try again!");
    } finally {
      setIsDownloading(false);
    }
  };

  const getModeIcon = (m: AnalysisMode) => {
    switch (m) {
      case 'love': return <Heart className="w-4 h-4" />;
      case 'friendship': return <Users className="w-4 h-4" />;
      case 'roast': return <Flame className="w-4 h-4" />;
      case 'family': return <Home className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      case 'drama': return <Drama className="w-4 h-4" />;
    }
  };

  const getModeLabel = (m: AnalysisMode): string => {
    const labels: Record<AnalysisMode, string> = {
      love: 'Love 💕',
      friendship: 'Friendship 🤝',
      roast: 'Roast 🔥',
      family: 'Family 👨‍👩‍👧‍👦',
      work: 'Work 💼',
      drama: 'Drama 🎭'
    };
    return labels[m];
  };

  const getInterestColor = (interest: number) => {
    if (interest >= 80) return "text-green-500";
    if (interest >= 60) return "text-yellow-500";
    if (interest >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <>
      <Helmet>
        <title>AI WhatsApp Chat Truth Analyzer - Free Relationship Analysis | MyPDFs</title>
        <meta name="description" content="Analyze your WhatsApp chats with AI! Discover hidden truths, interest levels, emotional tones, and get fun verdicts. Love, friendship & roast modes available." />
        <meta name="keywords" content="WhatsApp analyzer, chat analysis, relationship analyzer, AI chat analyzer, who texts first, interest level, WhatsApp truth, Telugu chat analyzer" />
        <meta property="og:title" content="AI WhatsApp Chat Truth Analyzer - Free Relationship Analysis" />
        <meta property="og:description" content="Discover the truth hidden in your WhatsApp chats! AI-powered analysis for love, friendship & fun roasts." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mypdfs.in/whatsapp-analyzer" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI WhatsApp Chat Truth Analyzer",
            "description": "AI-powered WhatsApp chat analysis tool for fun relationship insights",
            "url": "https://mypdfs.in/whatsapp-analyzer",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "All",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })}
        </script>
      </Helmet>

      <ToolLayout
        title="AI WhatsApp Chat Truth Analyzer"
        description="Paste your WhatsApp chat & discover the hidden truth! 🔥 Entertainment only."
        icon={MessageCircle}
        colorClass="bg-gradient-to-br from-green-500 to-emerald-600"
        category="EntertainmentApplication"
      >
        {/* Disclaimer Banner */}
        <Card className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <strong>🎭 Entertainment Only!</strong> This tool is for FUN, not actual relationship advice. 
              Results are AI-generated entertainment. We don't store your chats! 🔒
            </div>
          </div>
        </Card>

        {!result ? (
          <Card className="p-6 space-y-6">
            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Select Analysis Mode 🎯</label>
              <Tabs value={mode} onValueChange={(v) => setMode(v as AnalysisMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  <TabsTrigger value="love" className="gap-1 text-xs sm:text-sm py-2">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" /> Love 💕
                  </TabsTrigger>
                  <TabsTrigger value="friendship" className="gap-1 text-xs sm:text-sm py-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" /> Friend 🤝
                  </TabsTrigger>
                  <TabsTrigger value="roast" className="gap-1 text-xs sm:text-sm py-2">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4" /> Roast 🔥
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={mode} onValueChange={(v) => setMode(v as AnalysisMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  <TabsTrigger value="family" className="gap-1 text-xs sm:text-sm py-2">
                    <Home className="w-3 h-3 sm:w-4 sm:h-4" /> Family 👨‍👩‍👧‍👦
                  </TabsTrigger>
                  <TabsTrigger value="work" className="gap-1 text-xs sm:text-sm py-2">
                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" /> Work 💼
                  </TabsTrigger>
                  <TabsTrigger value="drama" className="gap-1 text-xs sm:text-sm py-2">
                    <Drama className="w-3 h-3 sm:w-4 sm:h-4" /> Drama 🎭
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Languages className="w-4 h-4" /> Result Language 🌐
              </label>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telugu-english">🇮🇳 Telugu + English Mix</SelectItem>
                  <SelectItem value="hindi-english">🇮🇳 Hindi + English Mix</SelectItem>
                  <SelectItem value="telugu">🇮🇳 తెలుగు (Pure Telugu)</SelectItem>
                  <SelectItem value="hindi">🇮🇳 हिंदी (Pure Hindi)</SelectItem>
                  <SelectItem value="english">🇬🇧 English Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chat Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Paste WhatsApp Chat Here 📱
              </label>
              <Textarea
                placeholder="Export your WhatsApp chat (without media) and paste it here...

Example format:
[12/01/25, 10:30:15 AM] John: Hey! What's up?
[12/01/25, 10:32:00 AM] Jane: Nothing much, just chilling 😊"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                💡 How to export: WhatsApp → Chat → More → Export Chat → Without Media
              </p>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !chatText.trim()}
              className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing... Oka Nimisham 🔍
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Reveal The Truth! 🔥
                </>
              )}
            </Button>
          </Card>
        ) : (
          /* Results Display */
          <div className="space-y-6">
            {/* Shareable Image Card */}
            <div 
              ref={shareCardRef}
              className="p-6 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white shadow-2xl"
            >
              <div className="text-center space-y-4">
                {/* Header */}
                <div className="flex items-center justify-center gap-2 text-white/90">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">WhatsApp Chat Analysis</span>
                </div>
                
                {/* Mode Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium">
                  {getModeIcon(result.analysis.mode)}
                  <span className="capitalize">{result.analysis.mode} Mode</span>
                </div>
                
                {/* Main Vibes */}
                <h2 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
                  {result.analysis.overallVibes} ✨
                </h2>
                
                {/* Verdict */}
                <p className="text-lg md:text-xl font-medium px-4 drop-shadow">
                  {result.analysis.verdict}
                </p>
                
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/15 rounded-xl p-3">
                    <div className="text-2xl font-bold">{result.personA}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-lg">❤️</span>
                      <span className="text-xl font-bold">{result.analysis.personAInterest}%</span>
                    </div>
                    <div className="text-xs text-white/80 mt-1">{result.analysis.personAEmotionalTone}</div>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3">
                    <div className="text-2xl font-bold">{result.personB}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-lg">❤️</span>
                      <span className="text-xl font-bold">{result.analysis.personBInterest}%</span>
                    </div>
                    <div className="text-xs text-white/80 mt-1">{result.analysis.personBEmotionalTone}</div>
                  </div>
                </div>

                {/* Fun Fact */}
                <div className="bg-white/10 rounded-lg p-3 text-sm">
                  🎲 {result.analysis.funFact}
                </div>
                
                {/* Watermark */}
                <div className="pt-2 text-white/60 text-xs">
                  mypdfs.in/whatsapp-analyzer 🔥
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button 
                onClick={handleDownloadCard} 
                disabled={isDownloading}
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Image 📸
                  </>
                )}
              </Button>
              <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share Text 📤
              </Button>
              <Button onClick={() => setResult(null)} variant="secondary">
                Analyze Another 🔄
              </Button>
            </div>

            {/* Person Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Person A */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{result.personA}</h3>
                  <Badge variant="outline">{result.stats.personAMessages} msgs</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Interest Level</span>
                    <span className={`font-bold ${getInterestColor(result.analysis.personAInterest)}`}>
                      {result.analysis.personAInterest}%
                    </span>
                  </div>
                  <Progress value={result.analysis.personAInterest} className="h-3" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emotional Tone</span>
                    <span className="font-medium">{result.analysis.personAEmotionalTone}</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground text-xs">Hidden Intent:</span>
                    <p className="font-medium mt-1">{result.analysis.personAHiddenIntent}</p>
                  </div>
                </div>
              </Card>

              {/* Person B */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{result.personB}</h3>
                  <Badge variant="outline">{result.stats.personBMessages} msgs</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Interest Level</span>
                    <span className={`font-bold ${getInterestColor(result.analysis.personBInterest)}`}>
                      {result.analysis.personBInterest}%
                    </span>
                  </div>
                  <Progress value={result.analysis.personBInterest} className="h-3" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emotional Tone</span>
                    <span className="font-medium">{result.analysis.personBEmotionalTone}</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground text-xs">Hidden Intent:</span>
                    <p className="font-medium mt-1">{result.analysis.personBHiddenIntent}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stats & Fun Facts */}
            <Card className="p-5 space-y-4">
              <h3 className="font-bold text-lg">📊 Chat Stats</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.stats.totalMessages}</div>
                  <div className="text-xs text-muted-foreground">Total Messages</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{result.stats.whoTextsFirst}</div>
                  <div className="text-xs text-muted-foreground">Texts First More</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{result.stats.textsFirstPercentage}%</div>
                  <div className="text-xs text-muted-foreground">Initiator Rate</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-purple-500">🎯</div>
                  <div className="text-xs text-muted-foreground capitalize">{result.analysis.mode} Mode</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">⚡ Reply Speed Verdict</div>
                <p className="font-medium">{result.analysis.replySpeedVerdict}</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">🎲 Fun Fact</div>
                <p className="font-medium">{result.analysis.funFact}</p>
              </div>
            </Card>

            {/* Disclaimer Reminder */}
            <p className="text-center text-sm text-muted-foreground">
              🎭 Remember: This is for entertainment only! Don't take it too seriously ra! 😄
            </p>
          </div>
        )}

        <ToolSEOContent
          toolName="AI WhatsApp Chat Truth Analyzer"
          whatIs="The AI WhatsApp Chat Truth Analyzer is a fun, viral tool that analyzes your WhatsApp conversations using artificial intelligence. Choose from 6 analysis modes (Love, Friendship, Roast, Family, Work, Drama) and get results in your preferred language - Telugu, Hindi, English, or mixed! Discover entertaining insights about conversation patterns, interest levels, emotional tones, and hidden intents. Perfect for entertainment and sharing with friends!"
          howToUse={[
            "Export your WhatsApp chat: Open WhatsApp → Select chat → More options → Export chat → Without media",
            "Paste the exported chat text into the input box above",
            "Choose your analysis mode: Love, Friendship, Roast, Family, Work, or Drama",
            "Select your preferred result language: Telugu, Hindi, English, or mixed options",
            "Click 'Reveal The Truth!' to get your AI-powered analysis",
            "Share your fun results with friends on social media!"
          ]}
          features={[
            "Six analysis modes: Love, Friendship, Roast, Family, Work, and Drama",
            "Multi-language support: Telugu, Hindi, English, and mixed languages",
            "తెలుగు మరియు हिंदी లో ఫలితాలు పొందండి (Results in Telugu & Hindi)",
            "AI-powered interest level detection for both participants",
            "Emotional tone analysis with hidden intent detection",
            "Who texts first and reply speed analysis",
            "Screenshot-friendly result cards for easy sharing",
            "100% private - chats are never stored",
            "Mobile-optimized viral-style UI"
          ]}
          safetyNote="Your privacy is our priority! We do NOT store any chat data. All analysis happens in real-time and is immediately discarded after showing results. The tool is strictly for entertainment purposes and should not be used for actual relationship decisions."
          faqs={[
            {
              question: "Is my WhatsApp chat data stored?",
              answer: "No! We never store your chat data. All analysis happens in real-time and data is immediately discarded after generating results. Your conversations remain completely private."
            },
            {
              question: "How accurate is the analysis?",
              answer: "This tool is designed for ENTERTAINMENT ONLY! The results are AI-generated fun insights and should not be taken as actual relationship advice or psychological analysis."
            },
            {
              question: "What languages are supported?",
              answer: "Results can be in Pure Telugu (తెలుగు), Pure Hindi (हिंदी), English, Telugu-English mix, or Hindi-English mix. Perfect for Indian users!"
            },
            {
              question: "What's the difference between the six modes?",
              answer: "Love mode focuses on romantic signals, Friendship analyzes buddy dynamics, Roast gives playful funny observations, Family mode highlights care patterns, Work mode analyzes professional dynamics, and Drama mode treats your chat like a TV soap opera!"
            },
            {
              question: "How do I export my WhatsApp chat?",
              answer: "Open WhatsApp → Go to the chat you want to analyze → Tap the three dots menu → Export chat → Choose 'Without media' → Copy or share the text file content."
            },
            {
              question: "Does it work with group chats?",
              answer: "The tool works best with one-on-one chats. For group chats, it will analyze the top 2 most active participants."
            }
          ]}
        />
      </ToolLayout>
    </>
  );
};

export default WhatsAppAnalyzer;
