import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split("T")[0]);
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalWeeks: number;
    totalMonths: number;
    nextBirthday: string;
    daysUntilBirthday: number;
  } | null>(null);
  const { toast } = useToast();

  const calculateAge = () => {
    if (!birthDate) {
      toast({ title: "Date required", description: "Please enter your birth date.", variant: "destructive" });
      return;
    }

    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (birth > target) {
      toast({ title: "Invalid date", description: "Birth date cannot be in the future.", variant: "destructive" });
      return;
    }

    // Calculate exact age
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Total calculations
    const diffTime = Math.abs(target.getTime() - birth.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    // Next birthday
    const thisYearBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    let nextBirthday = thisYearBirthday;
    if (thisYearBirthday <= target) {
      nextBirthday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      nextBirthday: nextBirthday.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      daysUntilBirthday,
    });
  };

  return (
    <ToolLayout
      title="Age Calculator"
      description="Calculate your exact age in years, months, days, hours, and minutes. Find your next birthday countdown."
      icon={Calendar}
      colorClass="bg-gradient-to-br from-pink-400 to-rose-400"
      category="Calculators"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthDate">Date of Birth</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetDate">Calculate Age On</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={calculateAge} className="w-full" size="lg">
          <Calculator className="mr-2 h-4 w-4" />
          Calculate Age
        </Button>

        {result && (
          <div className="space-y-4">
            {/* Main Age Display */}
            <div className="rounded-lg bg-primary/10 p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Your Age</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">{result.years}</span>
                  <p className="text-sm text-muted-foreground">Years</p>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">{result.months}</span>
                  <p className="text-sm text-muted-foreground">Months</p>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">{result.days}</span>
                  <p className="text-sm text-muted-foreground">Days</p>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{result.totalMonths.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Months</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{result.totalWeeks.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Weeks</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{result.totalDays.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Days</p>
              </div>
            </div>

            {/* Next Birthday */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-1">🎂 Next Birthday</p>
              <p className="font-medium">{result.nextBirthday}</p>
              <p className="text-sm text-primary font-medium mt-1">
                {result.daysUntilBirthday === 0
                  ? "Happy Birthday! 🎉"
                  : `${result.daysUntilBirthday} days to go`}
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
