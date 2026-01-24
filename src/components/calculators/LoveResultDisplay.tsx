import { useState, useEffect } from "react";
import { Heart, RefreshCw, Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LoveResult {
  percentage: number;
  message: string;
  nameMatchScore: number;
  numerologyScore: number;
  compatibilityLevel: string;
}

interface LoveResultDisplayProps {
  result: LoveResult;
  name1: string;
  name2: string;
  onReset: () => void;
  onShare: () => void;
  translations: {
    tryAnother: string;
    shareResult: string;
    compatibility: string;
    nameMatch: string;
    numerology: string;
  };
}

export function LoveResultDisplay({
  result,
  name1,
  name2,
  onReset,
  onShare,
  translations: t,
}: LoveResultDisplayProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

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
      } else {
        setAnimatedPercentage(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [result.percentage]);

  const getHeartColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-pink-500";
    if (percentage >= 60) return "text-rose-400";
    return "text-pink-300";
  };

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 rounded-xl border border-pink-200 dark:border-pink-800 animate-scale-in">
      <div className="text-center space-y-4">
        {/* Names Display */}
        <div className="flex items-center justify-center gap-3 text-lg font-medium flex-wrap">
          <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/50 rounded-full">{name1}</span>
          <Heart className={`w-6 h-6 ${getHeartColor(result.percentage)} animate-pulse`} fill="currentColor" />
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
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
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
        </div>

        {/* Message */}
        <p className="text-lg font-medium text-pink-700 dark:text-pink-300 px-4">
          {result.message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap pt-2">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t.tryAnother}
          </Button>
          <Button 
            variant="default" 
            onClick={onShare} 
            className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500"
          >
            <Copy className="w-4 h-4" />
            {t.shareResult}
          </Button>
        </div>
      </div>
    </div>
  );
}
