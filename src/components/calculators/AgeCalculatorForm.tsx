import { Calendar, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgeCalculatorFormProps {
  birthDate: string;
  targetDate: string;
  onBirthDateChange: (date: string) => void;
  onTargetDateChange: (date: string) => void;
  onCalculate: () => void;
  translations: {
    ageCalculator: string;
    dateOfBirth: string;
    calculateAge: string;
    calculateAgeOn: string;
  };
}

export function AgeCalculatorForm({
  birthDate,
  targetDate,
  onBirthDateChange,
  onTargetDateChange,
  onCalculate,
  translations: t,
}: AgeCalculatorFormProps) {
  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Cake className="w-6 h-6" />
          {t.ageCalculator}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthDate">{t.dateOfBirth} *</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => onBirthDateChange(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetDate">{t.calculateAgeOn}</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => onTargetDateChange(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        <Button
          onClick={onCalculate}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg py-6"
        >
          <Calendar className="w-5 h-5 mr-2" />
          {t.calculateAge}
        </Button>
      </CardContent>
    </Card>
  );
}
