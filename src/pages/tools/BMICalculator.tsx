import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Calculator, Heart, Droplets, Moon, Dumbbell, Apple, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ToolSEOContent from "@/components/ToolSEOContent";
import { CanonicalHead } from "@/components/CanonicalHead";

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  bgColor: string;
  healthyRange: string;
  advice: string;
  explanation: string;
  riskLevel: string;
}

const WELLNESS_TIPS = [
  { icon: Apple, title: "Balanced Diet", tip: "Aim for a variety of fruits, vegetables, whole grains, and lean proteins. No single food is magic — consistency matters most." },
  { icon: Dumbbell, title: "Regular Activity", tip: "150 minutes of moderate activity per week (like brisk walking) supports heart health and weight management." },
  { icon: Droplets, title: "Stay Hydrated", tip: "Drinking 6–8 glasses of water daily supports metabolism, energy levels, and overall well-being." },
  { icon: Moon, title: "Quality Sleep", tip: "7–9 hours of sleep per night helps regulate appetite hormones and supports recovery." },
  { icon: Heart, title: "Consistency", tip: "Small, sustainable changes over time are more effective than extreme short-term diets." },
];

const BMI_CATEGORIES = [
  { range: "Below 16.0", label: "Severe Underweight", color: "bg-red-500" },
  { range: "16.0 – 16.9", label: "Moderate Underweight", color: "bg-orange-400" },
  { range: "17.0 – 18.4", label: "Mild Underweight", color: "bg-yellow-400" },
  { range: "18.5 – 24.9", label: "Normal Weight", color: "bg-green-500" },
  { range: "25.0 – 29.9", label: "Overweight", color: "bg-yellow-500" },
  { range: "30.0 – 34.9", label: "Obese Class I", color: "bg-orange-500" },
  { range: "35.0 – 39.9", label: "Obese Class II", color: "bg-red-400" },
  { range: "40.0+", label: "Obese Class III", color: "bg-red-600" },
];

function calculateBMIResult(unit: "metric" | "imperial", weight: string, height: string, heightFeet: string, heightInches: string): BMIResult | null {
  let weightKg: number;
  let heightM: number;

  if (unit === "metric") {
    weightKg = parseFloat(weight);
    heightM = parseFloat(height) / 100;
  } else {
    weightKg = parseFloat(weight) * 0.453592;
    const totalInches = parseFloat(heightFeet) * 12 + parseFloat(heightInches || "0");
    heightM = totalInches * 0.0254;
  }

  if (isNaN(weightKg) || isNaN(heightM) || weightKg <= 0 || heightM <= 0) return null;

  const bmi = weightKg / (heightM * heightM);
  let category: string, color: string, bgColor: string, advice: string, explanation: string, riskLevel: string;

  if (bmi < 16) {
    category = "Severe Underweight"; color = "text-red-600"; bgColor = "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900";
    explanation = "Your BMI suggests you are significantly below the healthy weight range. This may indicate nutritional deficiency.";
    advice = "Please consult a healthcare professional for guidance on healthy weight gain through a balanced nutritional plan.";
    riskLevel = "Higher risk of nutritional deficiency, weakened immunity, and bone health concerns.";
  } else if (bmi < 17) {
    category = "Moderate Underweight"; color = "text-orange-600"; bgColor = "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900";
    explanation = "Your BMI is below the healthy range. This may affect your energy levels and overall health.";
    advice = "Consider consulting a nutritionist for a balanced diet plan to reach a healthier weight gradually.";
    riskLevel = "Moderate risk of fatigue, nutrient deficiency, and reduced immune function.";
  } else if (bmi < 18.5) {
    category = "Mild Underweight"; color = "text-yellow-600"; bgColor = "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900";
    explanation = "Your BMI is slightly below the normal range. Small dietary adjustments may help.";
    advice = "A slight increase in calorie intake with nutrient-rich foods like nuts, avocados, and whole grains may help.";
    riskLevel = "Low risk, but maintaining adequate nutrition is important for long-term health.";
  } else if (bmi < 25) {
    category = "Normal Weight"; color = "text-green-600"; bgColor = "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900";
    explanation = "Your BMI falls within the healthy weight range. This is generally associated with lower health risks.";
    advice = "Great job! Maintain your healthy lifestyle with a balanced diet, regular exercise, and adequate sleep.";
    riskLevel = "Lowest risk category for weight-related health conditions.";
  } else if (bmi < 30) {
    category = "Overweight"; color = "text-yellow-600"; bgColor = "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900";
    explanation = "Your BMI is above the normal range. This doesn't necessarily mean you're unhealthy, but monitoring is recommended.";
    advice = "Consider increasing physical activity and making gradual dietary adjustments. Small changes can make a big difference.";
    riskLevel = "Slightly elevated risk for conditions like high blood pressure and type 2 diabetes.";
  } else if (bmi < 35) {
    category = "Obese Class I"; color = "text-orange-600"; bgColor = "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900";
    explanation = "Your BMI indicates obesity. Working with healthcare providers can help develop a personalized plan.";
    advice = "Consult a healthcare provider for a personalized weight management plan that includes diet, exercise, and lifestyle changes.";
    riskLevel = "Increased risk for cardiovascular disease, diabetes, and joint problems.";
  } else if (bmi < 40) {
    category = "Obese Class II"; color = "text-red-500"; bgColor = "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900";
    explanation = "Your BMI suggests significant obesity. Professional medical guidance is strongly recommended.";
    advice = "Please seek medical advice for comprehensive weight management strategies tailored to your health needs.";
    riskLevel = "High risk for serious health conditions. Professional support is important.";
  } else {
    category = "Obese Class III"; color = "text-red-700"; bgColor = "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900";
    explanation = "Your BMI indicates severe obesity. Immediate consultation with healthcare professionals is recommended.";
    advice = "Working with a healthcare team including doctors and nutritionists can help create a safe, effective plan.";
    riskLevel = "Highest risk category. Comprehensive medical support is strongly recommended.";
  }

  const minHealthyWeight = 18.5 * heightM * heightM;
  const maxHealthyWeight = 24.9 * heightM * heightM;
  const weightUnit = unit === "metric" ? "kg" : "lbs";
  const minDisplay = unit === "metric" ? minHealthyWeight.toFixed(1) : (minHealthyWeight * 2.20462).toFixed(1);
  const maxDisplay = unit === "metric" ? maxHealthyWeight.toFixed(1) : (maxHealthyWeight * 2.20462).toFixed(1);

  return {
    bmi: Math.round(bmi * 10) / 10,
    category, color, bgColor,
    healthyRange: `${minDisplay} – ${maxDisplay} ${weightUnit}`,
    advice, explanation, riskLevel,
  };
}

export default function BMICalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const { toast } = useToast();

  const handleCalculate = () => {
    const r = calculateBMIResult(unit, weight, height, heightFeet, heightInches);
    if (!r) {
      toast({ title: "Invalid input", description: "Please enter valid weight and height.", variant: "destructive" });
      return;
    }
    setResult(r);
  };

  const getBMIPosition = (bmi: number) => {
    const clamped = Math.min(Math.max(bmi, 15), 40);
    return ((clamped - 15) / (40 - 15)) * 100;
  };

  return (
    <>
      <CanonicalHead
        title="BMI Calculator Free Online - Body Mass Index Calculator | VexaTool"
        description="Free BMI calculator. Calculate your Body Mass Index instantly with health guidance, wellness tips, and healthy weight range."
        keywords="BMI calculator, body mass index, weight calculator, health calculator, BMI chart, BMI check, healthy weight"
      />
      <ToolLayout
        title="BMI Calculator"
        description="Calculate your Body Mass Index (BMI) and get personalized health guidance."
        icon={Activity}
        colorClass="bg-gradient-to-br from-pink-500 to-rose-600"
        category="Health Tools"
      >
        <div className="space-y-8">
          {/* Input Section */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-base font-medium">Unit System</Label>
              <Select value={unit} onValueChange={(v: "metric" | "imperial") => { setUnit(v); setResult(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs, ft/in)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-base font-medium">Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
                <Input id="weight" type="number" placeholder={unit === "metric" ? "70" : "154"} value={weight} onChange={(e) => setWeight(e.target.value)} min="1" />
              </div>
              {unit === "metric" ? (
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-base font-medium">Height (cm)</Label>
                  <Input id="height" type="number" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)} min="1" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-base font-medium">Height</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="5" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} min="1" className="flex-1" />
                    <span className="flex items-center text-sm text-muted-foreground">ft</span>
                    <Input type="number" placeholder="9" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} min="0" max="11" className="flex-1" />
                    <span className="flex items-center text-sm text-muted-foreground">in</span>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate BMI
            </Button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {/* Primary Result Card */}
              <div className={`rounded-xl border p-6 ${result.bgColor}`}>
                <div className="text-center space-y-3">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Body Mass Index</p>
                  <p className={`text-6xl font-bold ${result.color}`}>{result.bmi}</p>
                  <p className={`text-xl font-semibold ${result.color}`}>{result.category}</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">{result.explanation}</p>
                </div>
              </div>

              {/* BMI Scale */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-sm">BMI Scale</h3>
                <div className="relative">
                  <div className="h-5 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-green-500 via-50% via-yellow-400 to-red-500">
                    <div
                      className="absolute top-0 w-0.5 h-5 bg-foreground shadow-md"
                      style={{ left: `${getBMIPosition(result.bmi)}%`, transform: "translateX(-50%)" }}
                    />
                  </div>
                  <div
                    className="absolute -top-6 text-xs font-bold px-1.5 py-0.5 rounded bg-foreground text-background"
                    style={{ left: `${getBMIPosition(result.bmi)}%`, transform: "translateX(-50%)" }}
                  >
                    {result.bmi}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Healthy Range */}
                <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Healthy Weight Range</p>
                  <p className="text-2xl font-bold text-green-600">{result.healthyRange}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on your height for BMI 18.5 – 24.9</p>
                </div>

                {/* Risk Info */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Health Risk Assessment</p>
                  <p className="text-sm text-foreground">{result.riskLevel}</p>
                </div>
              </div>

              {/* Personalized Advice */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Recommendation</p>
                    <p className="text-sm text-muted-foreground">{result.advice}</p>
                  </div>
                </div>
              </div>

              {/* BMI Categories Reference */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-sm mb-3">BMI Categories Reference</h3>
                <div className="grid gap-1.5">
                  {BMI_CATEGORIES.map((cat) => (
                    <div key={cat.label} className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm ${result.category === cat.label ? 'bg-muted font-medium' : ''}`}>
                      <div className={`w-3 h-3 rounded-full shrink-0 ${cat.color}`} />
                      <span className="text-muted-foreground w-28 shrink-0">{cat.range}</span>
                      <span>{cat.label}</span>
                      {result.category === cat.label && <span className="ml-auto text-xs text-primary font-semibold">← You</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Wellness Tips */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-sm mb-4">General Wellness Tips</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {WELLNESS_TIPS.map((tip) => (
                    <div key={tip.title} className="rounded-lg bg-muted/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <tip.icon className="w-4 h-4 text-primary" />
                        <p className="font-medium text-sm">{tip.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limitations Notice */}
              <div className="rounded-xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/30 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Important Limitations of BMI</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>Athletes & muscular individuals:</strong> BMI may overestimate body fat since muscle weighs more than fat.</li>
                      <li><strong>Older adults:</strong> BMI may underestimate body fat due to age-related muscle loss.</li>
                      <li><strong>Children & teens:</strong> This calculator is for adults 20+. Children use age-specific BMI percentiles.</li>
                      <li><strong>Pregnancy:</strong> BMI is not an appropriate measure during pregnancy.</li>
                      <li><strong>Ethnicity:</strong> Health risks at different BMI values can vary across ethnic groups.</li>
                    </ul>
                    <p className="text-xs text-muted-foreground pt-1">
                      BMI is a screening tool, not a diagnosis. It does not measure body fat directly. For personalized health advice, please consult a healthcare professional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ToolSEOContent
            toolName="BMI Calculator"
            whatIs="Body Mass Index (BMI) is a widely used screening tool that estimates whether your weight falls within a healthy range for your height. While BMI is not a direct measure of body fat, it provides a quick, useful indicator for potential weight-related health risks. Our free BMI calculator supports both metric and imperial measurements, providing instant results along with your healthy weight range, personalized health guidance, and practical wellness tips."
            howToUse={[
              "Select your preferred unit system (Metric or Imperial).",
              "Enter your weight in kilograms or pounds.",
              "Enter your height in centimeters or feet and inches.",
              "Click 'Calculate BMI' to see your detailed results, health category, and personalized guidance."
            ]}
            features={[
              "Support for both metric (kg/cm) and imperial (lbs/ft-in) measurements.",
              "Visual BMI scale showing your exact position relative to health categories.",
              "Calculated healthy weight range based on your height.",
              "Personalized health advice based on your BMI category.",
              "Complete BMI categories reference table from Severe Underweight to Obese Class III.",
              "General wellness tips for diet, exercise, hydration, sleep, and consistency.",
              "Important BMI limitations explained for athletes, children, elderly, and pregnancy.",
              "Instant results with no registration required. All calculations are local."
            ]}
            safetyNote="BMI is a general screening tool and may not accurately reflect the health status of athletes, elderly individuals, or those with high muscle mass. For personalized health advice, please consult a healthcare professional. All calculations are performed locally in your browser with no data stored or transmitted."
            faqs={[
              { question: "What is a healthy BMI range?", answer: "A BMI between 18.5 and 24.9 is generally considered healthy for most adults. However, this range may vary based on age, gender, ethnicity, and muscle mass." },
              { question: "Is BMI accurate for athletes?", answer: "BMI may overestimate body fat in athletes and individuals with high muscle mass, as muscle weighs more than fat. Athletes should consider additional measurements like body fat percentage or waist circumference." },
              { question: "How often should I check my BMI?", answer: "For general health monitoring, checking your BMI monthly or quarterly is sufficient. If you're actively working on weight management, weekly checks can help track progress." },
              { question: "Does BMI apply to children?", answer: "Children and teens use age-and-gender-specific BMI percentiles rather than adult BMI categories. This calculator is designed for adults aged 20 and older." },
              { question: "Can BMI tell me my body fat percentage?", answer: "No. BMI is a weight-to-height ratio, not a body fat measurement. For body fat assessment, methods like DEXA scans, skinfold measurements, or bioelectrical impedance are more accurate." },
              { question: "Is this medical advice?", answer: "No. This calculator provides general wellness information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for personal health decisions." }
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
}