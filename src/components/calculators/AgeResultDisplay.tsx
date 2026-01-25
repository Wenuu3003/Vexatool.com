import { useState, useRef } from "react";
import { Cake, Clock, Calendar, Copy, Hash, Instagram, MessageCircle, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AgeInstagramStoryCard } from "./AgeInstagramStoryCard";
import { AgeWhatsAppCard } from "./AgeWhatsAppCard";
import { shareOrDownloadImage, canShareFiles } from "@/lib/shareUtils";
import { toast } from "sonner";

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  dayOfBirth: string;
}

interface AgeResultDisplayProps {
  result: AgeResult;
  birthDate: string;
  onShare: () => void;
  translations: {
    yourAge: string;
    years: string;
    months: string;
    days: string;
    nextBirthday: string;
    daysUntil: string;
    bornOn: string;
    shareResult: string;
    totalDays: string;
    totalWeeks: string;
    totalHours: string;
  };
}

export function AgeResultDisplay({
  result,
  birthDate,
  onShare,
  translations: t,
}: AgeResultDisplayProps) {
  const [isDownloadingStory, setIsDownloadingStory] = useState(false);
  const [isDownloadingWhatsApp, setIsDownloadingWhatsApp] = useState(false);
  const instagramStoryRef = useRef<HTMLDivElement>(null);
  const whatsappCardRef = useRef<HTMLDivElement>(null);

  const supportsNativeShare = canShareFiles();

  // Share/Download Instagram Story (1080x1920)
  const handleShareInstagramStory = async () => {
    if (!instagramStoryRef.current) {
      toast.error("Unable to capture story. Tap & hold to save.");
      return;
    }
    
    setIsDownloadingStory(true);
    
    try {
      const shareResult = await shareOrDownloadImage(
        instagramStoryRef.current,
        {
          backgroundColor: '#0a1628',
          width: 1080,
          height: 1920,
        },
        {
          title: `I'm ${result.years} years old! 🎂`,
          text: `I'm ${result.years} years, ${result.months} months, and ${result.days} days old! 🎂 Check your age at mypdfs.in/love-calculator`,
          fileName: `age-story-${result.years}years.png`,
        }
      );
      
      if (shareResult.shared) {
        toast.success("Shared successfully! 📸🎂");
      } else if (shareResult.downloaded) {
        toast.success("Instagram Story downloaded! 📸🎂", {
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

  // Share/Download WhatsApp Status (1080x1080)
  const handleShareWhatsApp = async () => {
    if (!whatsappCardRef.current) {
      toast.error("Unable to capture image. Tap & hold to save.");
      return;
    }
    
    setIsDownloadingWhatsApp(true);
    
    try {
      const shareResult = await shareOrDownloadImage(
        whatsappCardRef.current,
        {
          backgroundColor: '#3b82f6',
          width: 1080,
          height: 1080,
        },
        {
          title: `I'm ${result.years} years old! 🎂`,
          text: `I'm ${result.years} years, ${result.months} months, and ${result.days} days old! 💚 Check your age at mypdfs.in/love-calculator`,
          fileName: `age-whatsapp-${result.years}years.png`,
        }
      );
      
      if (shareResult.shared) {
        toast.success("Shared successfully! 💚🎂");
      } else if (shareResult.downloaded) {
        toast.success("WhatsApp Status downloaded! 💚🎂", {
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

  return (
    <>
      <div className="mt-6 space-y-4 animate-scale-in">
        {/* Main Age Display */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-center text-lg font-medium mb-4">{t.yourAge}</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-blue-600">{result.years}</div>
              <div className="text-sm text-muted-foreground">{t.years}</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-indigo-600">{result.months}</div>
              <div className="text-sm text-muted-foreground">{t.months}</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-purple-600">{result.days}</div>
              <div className="text-sm text-muted-foreground">{t.days}</div>
            </div>
          </div>
        </div>

        {/* Total Statistics */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800">
            <CardContent className="p-3 text-center">
              <Hash className="w-5 h-5 mx-auto mb-1 text-cyan-600" />
              <div className="text-xl font-bold text-cyan-600">{result.totalDays.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{t.totalDays}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
            <CardContent className="p-3 text-center">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-violet-600" />
              <div className="text-xl font-bold text-violet-600">{result.totalWeeks.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{t.totalWeeks}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 border-fuchsia-200 dark:border-fuchsia-800">
            <CardContent className="p-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-fuchsia-600" />
              <div className="text-xl font-bold text-fuchsia-600">{result.totalHours.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{t.totalHours}</div>
            </CardContent>
          </Card>
        </div>

        {/* Birthday Info */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 text-center">
              <Cake className="w-8 h-8 mx-auto mb-2 text-amber-600" />
              <h4 className="font-medium">{t.nextBirthday}</h4>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                {result.daysUntilBirthday === 0 ? "🎉" : result.daysUntilBirthday}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.daysUntilBirthday === 0 ? "Happy Birthday! 🎂" : t.daysUntil}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <h4 className="font-medium">{t.bornOn}</h4>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {result.dayOfBirth}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={onShare} 
            className="flex-1 gap-2"
          >
            <Copy className="w-4 h-4" />
            {t.shareResult}
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

      {/* Hidden Instagram Story Card for Download */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <AgeInstagramStoryCard
          ref={instagramStoryRef}
          result={result}
          birthDate={birthDate}
        />
      </div>

      {/* Hidden WhatsApp Status Card for Download */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <AgeWhatsAppCard
          ref={whatsappCardRef}
          result={result}
          birthDate={birthDate}
        />
      </div>
    </>
  );
}
