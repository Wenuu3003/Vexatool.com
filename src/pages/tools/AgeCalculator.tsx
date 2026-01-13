import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";

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
    <>
      <Helmet>
        <title>Age Calculator Free Online - Calculate Exact Age in Years, Months, Days | MyPDFs</title>
        <meta name="description" content="Free online age calculator. Calculate your exact age in years, months, and days. Find your next birthday countdown and total days lived." />
        <meta name="keywords" content="age calculator, calculate age, birthday calculator, age in days, age in months, exact age calculator" />
        <link rel="canonical" href="https://mypdfs.in/age-calculator" />
      </Helmet>
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

        <ToolSEOContent
          toolName="Age Calculator"
          whatIs="An age calculator determines your exact age in years, months, and days from your date of birth to any specified date. Beyond simple age calculation, our tool provides comprehensive statistics including your total age in months, weeks, and days, plus a countdown to your next birthday. This is useful for official documents, milestone celebrations, astrological purposes, or simply satisfying your curiosity about the exact time you have been alive."
          howToUse={[
            "Enter your date of birth in the first field.",
            "Optionally, change the 'Calculate Age On' date (defaults to today).",
            "Click 'Calculate Age' to see your results.",
            "View your exact age and additional statistics."
          ]}
          features={[
            "Calculate exact age in years, months, and days.",
            "View total age in months, weeks, and days.",
            "See countdown to your next birthday.",
            "Calculate age on any specific date, past or future.",
            "Accurate calculations accounting for leap years.",
            "Instant results with no registration required."
          ]}
          safetyNote="All calculations are performed locally in your browser. Your date of birth and personal information are not stored or transmitted to any server, ensuring complete privacy."
          faqs={[
            {
              question: "How accurate is the age calculation?",
              answer: "Our calculator accounts for leap years and varying month lengths, providing exact results down to the day. The calculation is based on the Gregorian calendar used worldwide."
            },
            {
              question: "Can I calculate age for a past date?",
              answer: "Yes, you can set any date in the 'Calculate Age On' field to see what your age was on that specific date, useful for historical records or documents."
            },
            {
              question: "Why might my age differ from other calculators?",
              answer: "Some calculators round months differently or handle partial months/days in various ways. Our calculator provides the most precise breakdown available."
            },
            {
              question: "Does this work for very old dates?",
              answer: "Yes, the calculator handles dates going back many centuries. However, calendar reforms and historical changes may affect accuracy for dates before the widespread adoption of the Gregorian calendar."
            }
          ]}
        />
      </div>
      </ToolLayout>
    </>
  );
}
