import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Percent } from "lucide-react";

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

  const calcBasic = () => {
    const p = parseFloat(val1);
    const n = parseFloat(val2);
    if (!isNaN(p) && !isNaN(n)) {
      setResult(((p / 100) * n).toFixed(2));
    }
  };

  const calcChange = () => {
    const from = parseFloat(changeFrom);
    const to = parseFloat(changeTo);
    if (!isNaN(from) && !isNaN(to) && from !== 0) {
      setChangeResult((((to - from) / from) * 100).toFixed(2));
    }
  };

  const calcIncrease = () => {
    const v = parseFloat(incVal);
    const p = parseFloat(incPercent);
    if (!isNaN(v) && !isNaN(p)) {
      const increased = v + (v * p) / 100;
      const decreased = v - (v * p) / 100;
      setIncResult(`Increase: ${increased.toFixed(2)} | Decrease: ${decreased.toFixed(2)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CanonicalHead
        title="Percentage Calculator Online Free – Calculate Percent Instantly | VexaTool"
        description="Free online percentage calculator. Calculate percentage of a number, percentage change, increase and decrease. Fast, accurate and easy to use."
        keywords="percentage calculator, percent calculator, calculate percentage, percentage change, percentage increase, percentage decrease"
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Percent className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Percentage Calculator</h1>
          <p className="text-muted-foreground">Calculate percentages quickly and accurately</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <div className="flex items-center gap-2">
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

        {/* SEO Content */}
        <div className="mt-12 prose prose-lg max-w-none">
          <h2 className="text-2xl font-semibold text-foreground mb-4">How to Use the Percentage Calculator</h2>
          <p className="text-muted-foreground leading-relaxed">
            This calculator handles the three most common percentage calculations. Use the <strong>Basic</strong> tab to find what a certain percentage of any number is — for example, "What is 15% of 300?" Use the <strong>Percentage Change</strong> tab to calculate the percentage difference between two values, which is useful for comparing prices, scores, or performance metrics. The <strong>Increase/Decrease</strong> tab shows you the result of adding or subtracting a percentage from a value, handy for calculating discounts, tips, or tax amounts.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PercentageCalculator;
