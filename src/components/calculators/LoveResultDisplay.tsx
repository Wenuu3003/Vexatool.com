import { useState, useEffect, useRef } from "react";
import { Heart, RefreshCw, Copy, Sparkles, PartyPopper, Download, Loader2, Star, Instagram, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti, useCelebrationSound } from "@/components/Confetti";
import { LoveShareCard } from "./LoveShareCard";
import { LoveInstagramStoryCard } from "./LoveInstagramStoryCard";
import { LoveWhatsAppCard } from "./LoveWhatsAppCard";
import { shareOrDownloadImage, canShareFiles } from "@/lib/shareUtils";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import type { ZodiacCompatibilityResult } from "@/lib/zodiacCompatibility";
export interface LoveResult {
  percentage: number;
  message: string;
  nameMatchScore: number;
  numerologyScore: number;
  zodiacResult: ZodiacCompatibilityResult | null;
  compatibilityLevel: string;
}

interface LoveResultDisplayProps {
  result: LoveResult;
  name1: string;
  name2: string;
  photo1: string | null;
  photo2: string | null;
  onReset: () => void;
  onShare: () => void;
  translations: {
    tryAnother: string;
    shareResult: string;
    compatibility: string;
    nameMatch: string;
    numerology: string;
    downloadCard?: string;
    zodiac?: string;
  };
}

export function LoveResultDisplay({
  result,
  name1,
  name2,
  photo1,
  photo2,
  onReset,
  onShare,
  translations: t,
}: LoveResultDisplayProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const playCelebrationSound = useCelebrationSound();
  const resultIdRef = useRef(`${name1}-${name2}-${result.percentage}`);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const instagramStoryRef = useRef<HTMLDivElement>(null);
  const whatsappCardRef = useRef<HTMLDivElement>(null);
  const [isDownloadingStory, setIsDownloadingStory] = useState(false);
  const [isDownloadingWhatsApp, setIsDownloadingWhatsApp] = useState(false);
  // Reset celebration state when result changes
  useEffect(() => {
    const newResultId = `${name1}-${name2}-${result.percentage}`;
    if (resultIdRef.current !== newResultId) {
      resultIdRef.current = newResultId;
      setCelebrationTriggered(false);
    }
  }, [name1, name2, result.percentage]);

  useEffect(() => {
    setAnimatedPercentage(0);
    const duration = 1500;
    const steps = 60;
    const increment = result.percentage / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.percentage) {
        setAnimatedPercentage(result.percentage);
        clearInterval(timer);
        
        // Trigger celebration for 90%+ compatibility
        if (result.percentage >= 90 && !celebrationTriggered) {
          setCelebrationTriggered(true);
          setShowConfetti(true);
          playCelebrationSound();
        }
      } else {
        setAnimatedPercentage(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [result.percentage, celebrationTriggered, playCelebrationSound]);

  const handleDownloadCard = async () => {
    if (!shareCardRef.current) {
      toast.error("Unable to capture image. Please try again.");
      return;
    }
    
    setIsDownloading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = shareCardRef.current;
      const isHigh = result.percentage >= 90;
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ec4899',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-share-card]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.background = isHigh
              ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 30%, #ef4444 60%, #f97316 100%)'
              : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #a855f7 100%)';
          }
        }
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `love-result-${name1}-${name2}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("Image downloaded! Share it on Instagram or WhatsApp! 💕");
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Share/Download Instagram Story (1080x1920)
  const handleShareInstagramStory = async () => {
    if (!instagramStoryRef.current) {
      toast.error("Unable to capture story. Tap & hold image to save.");
      return;
    }
    
    setIsDownloadingStory(true);
    
    try {
      const result = await shareOrDownloadImage(
        instagramStoryRef.current,
        {
          backgroundColor: '#1a0a1f',
          width: 1080,
          height: 1920,
        },
        {
          title: `Love Calculator: ${name1} ❤️ ${name2}`,
          text: `${name1} & ${name2} got ${resultData.percentage}% love compatibility! 💕 Try yours at mypdfs.in/love-calculator`,
          fileName: `love-story-${name1}-${name2}.png`,
        }
      );
      
      if (result.shared) {
        toast.success("Shared successfully! 📸💕");
      } else if (result.downloaded) {
        toast.success("Instagram Story downloaded! 📸💕", {
          description: "Perfect 9:16 format ready to share!"
        });
      }
    } catch (error) {
      console.error('Instagram Story error:', error);
      toast.error("Tap & hold image to save");
    } finally {
      setIsDownloadingStory(false);
    }
  };

  // Share/Download WhatsApp Status Card (1080x1080)
  const handleShareWhatsApp = async () => {
    if (!whatsappCardRef.current) {
      toast.error("Unable to capture image. Tap & hold to save.");
      return;
    }
    
    setIsDownloadingWhatsApp(true);
    
    try {
      const result = await shareOrDownloadImage(
        whatsappCardRef.current,
        {
          backgroundColor: '#ec4899',
          width: 1080,
          height: 1080,
        },
        {
          title: `Love Calculator: ${name1} ❤️ ${name2}`,
          text: `${name1} & ${name2} got ${resultData.percentage}% love compatibility! 💚 Try yours at mypdfs.in/love-calculator`,
          fileName: `love-whatsapp-${name1}-${name2}.png`,
        }
      );
      
      if (result.shared) {
        toast.success("Shared successfully! 💚");
      } else if (result.downloaded) {
        toast.success("WhatsApp Status downloaded! 💚", {
          description: "Perfect 1:1 square format ready to share!"
        });
      }
    } catch (error) {
      console.error('WhatsApp card error:', error);
      toast.error("Tap & hold image to save");
    } finally {
      setIsDownloadingWhatsApp(false);
    }
  };

  const supportsNativeShare = canShareFiles();
  const resultData = result;

  const isHighCompatibility = result.percentage >= 90;

  const getHeartColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-pink-500";
    if (percentage >= 60) return "text-rose-400";
    return "text-pink-300";
  };

  return (
    <>
      {/* Confetti celebration for 90%+ matches */}
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div className={`mt-6 p-6 rounded-xl border animate-scale-in ${
        isHighCompatibility 
          ? "bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 dark:from-pink-950/50 dark:via-rose-950/40 dark:to-amber-950/30 border-pink-300 dark:border-pink-700 shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30" 
          : "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200 dark:border-pink-800"
      }`}>
        <div className="text-center space-y-4">
          {/* High Compatibility Banner */}
          {isHighCompatibility && (
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 animate-fade-in">
              <PartyPopper className="w-5 h-5" />
              <span className="font-bold text-lg">Perfect Match!</span>
              <PartyPopper className="w-5 h-5" />
            </div>
          )}
          
          {/* Names Display */}
          <div className="flex items-center justify-center gap-3 text-lg font-medium flex-wrap">
            <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/50 rounded-full">{name1}</span>
            <Heart className={`w-6 h-6 ${getHeartColor(result.percentage)} ${isHighCompatibility ? 'animate-bounce' : 'animate-pulse'}`} fill="currentColor" />
            <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/50 rounded-full">{name2}</span>
          </div>

        {/* Animated Progress Circle */}
        <div className="relative w-44 h-44 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="75"
              stroke="currentColor"
              strokeWidth="14"
              fill="none"
              className="text-pink-100 dark:text-pink-900"
            />
            <circle
              cx="88"
              cy="88"
              r="75"
              stroke="url(#loveGradient)"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={471}
              strokeDashoffset={471 - (471 * animatedPercentage) / 100}
              className="transition-all duration-100"
            />
            <defs>
              <linearGradient id="loveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-pink-600 dark:text-pink-400">
              {animatedPercentage}%
            </span>
            <span className="text-sm text-muted-foreground font-medium">{result.compatibilityLevel}</span>
          </div>
        </div>

        {/* Compatibility Breakdown */}
        <div className={`grid gap-3 max-w-md mx-auto ${result.zodiacResult ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <div className="p-3 bg-white/80 dark:bg-gray-900/50 rounded-lg text-center">
            <Sparkles className="w-4 h-4 mx-auto mb-1 text-pink-500" />
            <div className="text-lg font-bold text-pink-600">{result.nameMatchScore}%</div>
            <div className="text-xs text-muted-foreground">{t.nameMatch}</div>
          </div>
          <div className="p-3 bg-white/80 dark:bg-gray-900/50 rounded-lg text-center">
            <span className="text-lg">🔮</span>
            <div className="text-lg font-bold text-purple-600">{result.numerologyScore}%</div>
            <div className="text-xs text-muted-foreground">{t.numerology}</div>
          </div>
          {result.zodiacResult && (
            <div className="p-3 bg-white/80 dark:bg-gray-900/50 rounded-lg text-center">
              <Star className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <div className="text-lg font-bold text-amber-600">{result.zodiacResult.score}%</div>
              <div className="text-xs text-muted-foreground">{t.zodiac || "Zodiac"}</div>
            </div>
          )}
        </div>

        {/* Zodiac Details */}
        {result.zodiacResult && (
          <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-2xl">{result.zodiacResult.sign1.symbol}</span>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{result.zodiacResult.sign1.name}</span>
              <Heart className="w-4 h-4 text-pink-500" fill="currentColor" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{result.zodiacResult.sign2.name}</span>
              <span className="text-2xl">{result.zodiacResult.sign2.symbol}</span>
            </div>
            <p className="text-center text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {result.zodiacResult.elementMatch}
            </p>
            <p className="text-center text-xs text-muted-foreground mt-1">
              {result.zodiacResult.description}
            </p>
          </div>
        )}

        {/* Message */}
        <p className="text-lg font-medium text-pink-700 dark:text-pink-300 px-4">
          {result.message}
        </p>

        {/* Actions */}
        <div className="flex gap-2 justify-center flex-wrap pt-2">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t.tryAnother}
          </Button>
          <Button 
            variant="outline" 
            onClick={onShare} 
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            {t.shareResult}
          </Button>
          <Button 
            variant="default" 
            onClick={handleDownloadCard}
            disabled={isDownloading}
            className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {t.downloadCard || "Download Card"}
          </Button>
          <Button 
            variant="default" 
            onClick={handleShareInstagramStory}
            disabled={isDownloadingStory}
            className="gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500"
          >
            {isDownloadingStory ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : supportsNativeShare ? (
              <Share2 className="w-4 h-4" />
            ) : (
              <Instagram className="w-4 h-4" />
            )}
            {supportsNativeShare ? "Share" : "📸"} Instagram
          </Button>
          <Button 
            variant="default" 
            onClick={handleShareWhatsApp}
            disabled={isDownloadingWhatsApp}
            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isDownloadingWhatsApp ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : supportsNativeShare ? (
              <Share2 className="w-4 h-4" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            {supportsNativeShare ? "Share" : "💚"} WhatsApp
          </Button>
        </div>
        </div>
      </div>

      {/* Hidden Share Card for Download */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <LoveShareCard
          ref={shareCardRef}
          name1={name1}
          name2={name2}
          photo1={photo1}
          photo2={photo2}
          percentage={result.percentage}
          nameMatchScore={result.nameMatchScore}
          numerologyScore={result.numerologyScore}
          zodiacResult={result.zodiacResult}
          compatibilityLevel={result.compatibilityLevel}
          message={result.message}
        />
      </div>

      {/* Hidden Instagram Story Card for Download */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <LoveInstagramStoryCard
          ref={instagramStoryRef}
          name1={name1}
          name2={name2}
          photo1={photo1}
          photo2={photo2}
          percentage={result.percentage}
          nameMatchScore={result.nameMatchScore}
          numerologyScore={result.numerologyScore}
          zodiacResult={result.zodiacResult}
          compatibilityLevel={result.compatibilityLevel}
          message={result.message}
        />
      </div>

      {/* Hidden WhatsApp Status Card for Download */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <LoveWhatsAppCard
          ref={whatsappCardRef}
          name1={name1}
          name2={name2}
          photo1={photo1}
          photo2={photo2}
          percentage={result.percentage}
          nameMatchScore={result.nameMatchScore}
          numerologyScore={result.numerologyScore}
          zodiacResult={result.zodiacResult}
          compatibilityLevel={result.compatibilityLevel}
          message={result.message}
        />
      </div>
    </>
  );
}
