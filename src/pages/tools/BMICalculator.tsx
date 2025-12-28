import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BMICalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    color: string;
    healthyRange: string;
    advice: string;
  } | null>(null);
  const { toast } = useToast();

  const calculateBMI = () => {
    let weightKg: number;
    let heightM: number;

    if (unit === "metric") {
      weightKg = parseFloat(weight);
      heightM = parseFloat(height) / 100;
    } else {
      weightKg = parseFloat(weight) * 0.453592; // lbs to kg
      const totalInches = parseFloat(heightFeet) * 12 + parseFloat(heightInches || "0");
      heightM = totalInches * 0.0254; // inches to meters
    }

    if (isNaN(weightKg) || isNaN(heightM) || weightKg <= 0 || heightM <= 0) {
      toast({ title: "Invalid input", description: "Please enter valid weight and height.", variant: "destructive" });
      return;
    }

    const bmi = weightKg / (heightM * heightM);

    let category: string;
    let color: string;
    let advice: string;

    if (bmi < 16) {
      category = "Severe Underweight";
      color = "text-red-600";
      advice = "Please consult a healthcare professional for guidance on healthy weight gain.";
    } else if (bmi < 17) {
      category = "Moderate Underweight";
      color = "text-orange-500";
      advice = "Consider consulting a nutritionist for a balanced diet plan.";
    } else if (bmi < 18.5) {
      category = "Mild Underweight";
      color = "text-yellow-500";
      advice = "A slight increase in calorie intake with nutrient-rich foods may help.";
    } else if (bmi < 25) {
      category = "Normal Weight";
      color = "text-green-600";
      advice = "Great! Maintain your healthy lifestyle with balanced diet and regular exercise.";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "text-yellow-500";
      advice = "Consider increasing physical activity and making dietary adjustments.";
    } else if (bmi < 35) {
      category = "Obese Class I";
      color = "text-orange-500";
      advice = "Consult a healthcare provider for a personalized weight management plan.";
    } else if (bmi < 40) {
      category = "Obese Class II";
      color = "text-red-500";
      advice = "Please seek medical advice for comprehensive weight management strategies.";
    } else {
      category = "Obese Class III";
      color = "text-red-600";
      advice = "Immediate consultation with healthcare professionals is recommended.";
    }

    // Calculate healthy weight range
    const minHealthyWeight = 18.5 * heightM * heightM;
    const maxHealthyWeight = 24.9 * heightM * heightM;
    const weightUnit = unit === "metric" ? "kg" : "lbs";
    const minDisplay = unit === "metric" ? minHealthyWeight.toFixed(1) : (minHealthyWeight * 2.20462).toFixed(1);
    const maxDisplay = unit === "metric" ? maxHealthyWeight.toFixed(1) : (maxHealthyWeight * 2.20462).toFixed(1);

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      color,
      healthyRange: `${minDisplay} - ${maxDisplay} ${weightUnit}`,
      advice,
    });
  };

  const getBMIPosition = (bmi: number) => {
    const minBMI = 15;
    const maxBMI = 40;
    const position = ((bmi - minBMI) / (maxBMI - minBMI)) * 100;
    return Math.min(Math.max(position, 0), 100);
  };

  return (
    <ToolLayout
      title="BMI Calculator"
      description="Calculate your Body Mass Index (BMI) and find out if you're in a healthy weight range."
      icon={Activity}
      colorClass="bg-gradient-to-br from-pink-500 to-rose-600"
      category="Health Tools"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Unit System</Label>
          <Select value={unit} onValueChange={(v: "metric" | "imperial") => setUnit(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric (kg, cm)</SelectItem>
              <SelectItem value="imperial">Imperial (lbs, ft/in)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
            <Input
              id="weight"
              type="number"
              placeholder={unit === "metric" ? "70" : "154"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="1"
            />
          </div>

          {unit === "metric" ? (
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="1"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Height</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="5"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  min="1"
                  className="flex-1"
                />
                <span className="flex items-center text-sm text-muted-foreground">ft</span>
                <Input
                  type="number"
                  placeholder="9"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  min="0"
                  max="11"
                  className="flex-1"
                />
                <span className="flex items-center text-sm text-muted-foreground">in</span>
              </div>
            </div>
          )}
        </div>

        <Button onClick={calculateBMI} className="w-full" size="lg">
          <Calculator className="mr-2 h-4 w-4" />
          Calculate BMI
        </Button>

        {result && (
          <div className="space-y-4">
            {/* BMI Result */}
            <div className="rounded-lg bg-muted/50 p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Your BMI</p>
              <p className={`text-5xl font-bold ${result.color}`}>{result.bmi}</p>
              <p className={`text-lg font-medium mt-2 ${result.color}`}>{result.category}</p>
            </div>

            {/* BMI Scale */}
            <div className="space-y-2">
              <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500">
                <div
                  className="absolute top-0 w-1 h-full bg-foreground"
                  style={{ left: `${getBMIPosition(result.bmi)}%`, transform: "translateX(-50%)" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
            </div>

            {/* Healthy Range */}
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Healthy Weight Range for Your Height</p>
              <p className="text-lg font-semibold text-green-600">{result.healthyRange}</p>
            </div>

            {/* Advice */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm">{result.advice}</p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Note: BMI is a general indicator and may not account for muscle mass, age, or other factors.
              Consult a healthcare professional for personalized advice.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
