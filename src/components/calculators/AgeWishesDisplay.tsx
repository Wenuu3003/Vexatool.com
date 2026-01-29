import { useEffect, useState, memo } from "react";
import { Cake, Star, Lightbulb, PartyPopper, Gift, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Confetti, useCelebrationSound } from "@/components/Confetti";
import {
  getBirthdayWish,
  getMotivationTip,
} from "@/data/ageCalculatorData";

interface AgeWishesDisplayProps {
  years: number;
  daysUntilBirthday: number;
  language: "en" | "te";
  translations: {
    birthdayWishes: string;
    motivationTips: string;
    advanceBirthday: string;
    belatedBirthday: string;
    presentBirthday: string;
    daysLeft: string;
    ageBasedAdvice: string;
  };
}

export const AgeWishesDisplay = memo(function AgeWishesDisplay({
  years,
  daysUntilBirthday,
  language,
  translations: t,
}: AgeWishesDisplayProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [birthdayWish, setBirthdayWish] = useState<{
    type: "present" | "advance" | "belated";
    wish: string;
  } | null>(null);
  const [motivationTip, setMotivationTip] = useState("");
  const playSound = useCelebrationSound();

  useEffect(() => {
    // Get birthday wish if applicable
    const wish = getBirthdayWish(daysUntilBirthday, language);
    setBirthdayWish(wish);

    // Trigger confetti for current birthday
    if (wish?.type === "present") {
      setShowConfetti(true);
      playSound();
    }

    // Get motivation tip
    const tip = getMotivationTip(years, language);
    setMotivationTip(tip);
  }, [years, daysUntilBirthday, language, playSound]);

  const getBirthdayTypeLabel = () => {
    if (!birthdayWish) return "";
    switch (birthdayWish.type) {
      case "present":
        return t.presentBirthday;
      case "advance":
        return t.advanceBirthday;
      case "belated":
        return t.belatedBirthday;
    }
  };

  const getBirthdayIcon = () => {
    if (!birthdayWish) return <Cake className="w-6 h-6" />;
    switch (birthdayWish.type) {
      case "present":
        return <PartyPopper className="w-6 h-6" />;
      case "advance":
        return <Clock className="w-6 h-6" />;
      case "belated":
        return <Gift className="w-6 h-6" />;
    }
  };

  const getBirthdayGradient = () => {
    if (!birthdayWish) return "from-pink-500 to-rose-500";
    switch (birthdayWish.type) {
      case "present":
        return "from-yellow-400 via-pink-500 to-purple-500";
      case "advance":
        return "from-blue-400 to-indigo-500";
      case "belated":
        return "from-amber-400 to-orange-500";
    }
  };

  return (
    <>
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="space-y-4 animate-fade-in">
        {/* Birthday Wishes Section */}
        {birthdayWish && (
          <Card
            className={`overflow-hidden border-2 border-pink-200 dark:border-pink-800 shadow-lg`}
          >
            <div
              className={`bg-gradient-to-r ${getBirthdayGradient()} p-4 text-white`}
            >
              <div className="flex items-center gap-3">
                {getBirthdayIcon()}
                <div>
                  <h4 className="font-bold text-lg">{t.birthdayWishes}</h4>
                  <p className="text-sm opacity-90">{getBirthdayTypeLabel()}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-lg leading-relaxed font-medium text-foreground">
                {birthdayWish.wish}
              </p>
              {birthdayWish.type === "advance" && daysUntilBirthday > 0 && (
                <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {daysUntilBirthday} {t.daysLeft}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Motivation Tips Section */}
        <Card className="overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-lg">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-lg">{t.motivationTips}</h4>
                <p className="text-sm opacity-90">{t.ageBasedAdvice}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-lg leading-relaxed font-medium text-foreground">
              {motivationTip}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
});
