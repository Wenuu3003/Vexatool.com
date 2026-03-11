import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Percent } from "lucide-react";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { useToast } from "@/hooks/use-toast";

const PercentageCalculator = () => {
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const [changeFrom, setChangeFrom] = useState("");
  const [changeTo, setChangeTo] = useState("");
  const [changeResult, setChangeResult] = useState<string | null>(null);

  const [incVal, setIncVal] = useState("");
  const [incPercent, setIncPercent] = useState("");
  const [incResult, setIncResult] = useState<string | null>(null);

  const { toast } = useToast();

  const calcBasic = () => {
    const p = parseFloat(val1);
    const n = parseFloat(val2);
    if (isNaN(p) || isNaN(n)) {
      toast({ title: "Invalid input", description: "Please enter valid numbers.", variant: "destructive" });
      return;
    }
    setResult(((p / 100) * n).toFixed(2));
  };

  const calcChange = () => {
    const from = parseFloat(changeFrom);
    const to = parseFloat(changeTo);
    if (isNaN(from) || isNaN(to)) {
      toast({ title: "Invalid input", description: "Please enter valid numbers.", variant: "destructive" });
      return;
    }
    if (from === 0) {
      toast({ title: "Invalid input", description: "The 'From' value cannot be zero.", variant: "destructive" });
      return;
    }
    setChangeResult((((to - from) / from) * 100).toFixed(2));
  };

  const calcIncrease = () => {
    const v = parseFloat(incVal);
    const p = parseFloat(incPercent);
    if (isNaN(v) || isNaN(p)) {
      toast({ title: "Invalid input", description: "Please enter valid numbers.", variant: "destructive" });
      return;
    }
    const increased = v + (v * p) / 100;
    const decreased = v - (v * p) / 100;
    setIncResult(`Increase: ${increased.toFixed(2)} | Decrease: ${decreased.toFixed(2)}`);
  };

  return (
    <>
      <CanonicalHead
        title="Percentage Calculator Online Free – Calculate Percent Instantly | VexaTool"
        description="Free online percentage calculator. Calculate percentage of a number, percentage change, increase and decrease. Fast, accurate and easy to use."
        keywords="percentage calculator, percent calculator, calculate percentage, percentage change, percentage increase, percentage decrease"
      />
      <ToolLayout
        title="Percentage Calculator"
        description="Calculate percentages quickly and accurately"
        icon={Percent}
        colorClass="bg-green-500"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic %</TabsTrigger>
            <TabsTrigger value="change">% Change</TabsTrigger>
            <TabsTrigger value="increase">Increase/Decrease</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What is X% of Y?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted-foreground">What is</span>
                  <Input type="number" value={val1} onChange={(e) => setVal1(e.target.value)} placeholder="e.g. 25" className="w-24" />
                  <span className="text-muted-foreground">% of</span>
                  <Input type="number" value={val2} onChange={(e) => setVal2(e.target.value)} placeholder="e.g. 200" className="w-24" />
                  <span className="text-muted-foreground">?</span>
                </div>
                <Button onClick={calcBasic} className="w-full">Calculate</Button>
                {result !== null && (
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Result</p>
                    <p className="text-3xl font-bold text-primary">{result}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="change">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Percentage Change</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">From</label>
                    <Input type="number" value={changeFrom} onChange={(e) => setChangeFrom(e.target.value)} placeholder="Old value" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">To</label>
                    <Input type="number" value={changeTo} onChange={(e) => setChangeTo(e.target.value)} placeholder="New value" />
                  </div>
                </div>
                <Button onClick={calcChange} className="w-full">Calculate Change</Button>
                {changeResult !== null && (
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Percentage Change</p>
                    <p className="text-3xl font-bold text-primary">{changeResult}%</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {parseFloat(changeResult) > 0 ? "Increase" : parseFloat(changeResult) < 0 ? "Decrease" : "No change"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="increase">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Increase / Decrease by %</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Value</label>
                    <Input type="number" value={incVal} onChange={(e) => setIncVal(e.target.value)} placeholder="e.g. 500" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Percentage</label>
                    <Input type="number" value={incPercent} onChange={(e) => setIncPercent(e.target.value)} placeholder="e.g. 10" />
                  </div>
                </div>
                <Button onClick={calcIncrease} className="w-full">Calculate</Button>
                {incResult !== null && (
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Results</p>
                    <p className="text-lg font-bold text-primary">{incResult}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ToolSEOContent
          toolName="Percentage Calculator"
          whatIs="The Percentage Calculator handles the three most common percentage calculations: finding what X% of Y is, calculating percentage change between two values, and computing increase/decrease by a percentage."
          howToUse={[
            "Choose a calculation type from the tabs.",
            "Enter your values in the input fields.",
            "Click Calculate to see the result.",
          ]}
          features={[
            "Basic percentage calculation (X% of Y)",
            "Percentage change between two values",
            "Increase and decrease calculations",
            "Instant results with clear display",
            "Input validation with error messages",
            "Works on desktop and mobile",
          ]}
          safetyNote="All calculations are performed in your browser. No data is sent to any server."
          faqs={[
            { question: "How do I calculate a percentage?", answer: "Use the Basic tab. Enter the percentage and the number, then click Calculate. For example, 25% of 200 = 50." },
            { question: "How do I find percentage change?", answer: "Use the % Change tab. Enter the old value and new value to see the percentage increase or decrease." },
            { question: "Can I use decimals?", answer: "Yes, all inputs accept decimal numbers for precise calculations." },
          ]}
        />
      </ToolLayout>
    </>
  );
};

export default PercentageCalculator;
