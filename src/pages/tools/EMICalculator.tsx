import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EMIResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  schedule: Array<{
    month: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function EMICalculator() {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [tenureType, setTenureType] = useState<"months" | "years">("years");
  const [result, setResult] = useState<EMIResult | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateEMI = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = tenureType === "years" ? parseFloat(tenure) * 12 : parseFloat(tenure);

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || n <= 0) {
      toast({ title: "Invalid input", description: "Please enter valid values.", variant: "destructive" });
      return;
    }

    if (parseFloat(interestRate) < 0) {
      toast({ title: "Invalid rate", description: "Interest rate cannot be negative.", variant: "destructive" });
      return;
    }

    let emi: number;
    if (parseFloat(interestRate) === 0) {
      emi = p / n;
    } else {
      emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    // Generate amortization schedule
    const schedule: EMIResult["schedule"] = [];
    let balance = p;
    const monthlyRate = parseFloat(interestRate) / 12 / 100;

    for (let month = 1; month <= n; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance = Math.max(0, balance - principalPayment);

      schedule.push({
        month,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      });
    }

    setResult({
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      schedule,
    });
  };

  return (
    <ToolLayout
      title="EMI Calculator"
      description="Calculate your Equated Monthly Installment (EMI) for home loans, car loans, and personal loans."
      icon={Banknote}
      colorClass="bg-gradient-to-br from-indigo-500 to-purple-600"
      category="Financial Tools"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="principal">Loan Amount (₹)</Label>
            <Input
              id="principal"
              type="number"
              placeholder="1000000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Interest Rate (% per annum)</Label>
            <Input
              id="rate"
              type="number"
              placeholder="8.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenure">Loan Tenure</Label>
            <div className="flex gap-2">
              <Input
                id="tenure"
                type="number"
                placeholder={tenureType === "years" ? "20" : "240"}
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                min="1"
                className="flex-1"
              />
              <select
                value={tenureType}
                onChange={(e) => setTenureType(e.target.value as "months" | "years")}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>

        <Button onClick={calculateEMI} className="w-full" size="lg">
          <Calculator className="mr-2 h-4 w-4" />
          Calculate EMI
        </Button>

        {result && (
          <div className="space-y-6">
            {/* EMI Result */}
            <div className="rounded-lg bg-primary/10 p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Monthly EMI</p>
              <p className="text-4xl font-bold text-primary">{formatCurrency(result.emi)}</p>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">Principal Amount</p>
                <p className="text-xl font-semibold">{formatCurrency(parseFloat(principal))}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-xl font-semibold text-orange-500">{formatCurrency(result.totalInterest)}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Payment</p>
                <p className="text-xl font-semibold">{formatCurrency(result.totalPayment)}</p>
              </div>
            </div>

            {/* Visual Breakdown */}
            <div className="space-y-2">
              <div className="flex h-4 rounded-full overflow-hidden">
                <div
                  className="bg-primary"
                  style={{ width: `${(parseFloat(principal) / result.totalPayment) * 100}%` }}
                />
                <div className="bg-orange-500 flex-1" />
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span>Principal ({((parseFloat(principal) / result.totalPayment) * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span>Interest ({((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            {/* Amortization Schedule Toggle */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSchedule(!showSchedule)}
            >
              {showSchedule ? "Hide" : "Show"} Amortization Schedule
            </Button>

            {showSchedule && (
              <div className="rounded-lg border overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Month</th>
                        <th className="p-3 text-right">Principal</th>
                        <th className="p-3 text-right">Interest</th>
                        <th className="p-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row) => (
                        <tr key={row.month} className="border-t">
                          <td className="p-3">{row.month}</td>
                          <td className="p-3 text-right">{formatCurrency(row.principal)}</td>
                          <td className="p-3 text-right text-orange-500">{formatCurrency(row.interest)}</td>
                          <td className="p-3 text-right">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
