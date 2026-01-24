import { Cake, Clock, Calendar, Copy, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  onShare,
  translations: t,
}: AgeResultDisplayProps) {
  return (
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

      <Button 
        variant="default" 
        onClick={onShare} 
        className="w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
      >
        <Copy className="w-4 h-4" />
        {t.shareResult}
      </Button>
    </div>
  );
}
