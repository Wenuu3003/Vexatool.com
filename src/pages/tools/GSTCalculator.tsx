import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Calculator, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ToolSEOContent from "@/components/ToolSEOContent";

const gstRates = [
  { value: "0", label: "0% (Exempted)" },
  { value: "0.25", label: "0.25%" },
  { value: "3", label: "3%" },
  { value: "5", label: "5%" },
  { value: "12", label: "12%" },
  { value: "18", label: "18%" },
  { value: "28", label: "28%" },
];

type CalculationType = "exclusive" | "inclusive";

interface GSTResult {
  originalAmount: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  baseAmount: number;
}

export default function GSTCalculator() {
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [calculationType, setCalculationType] = useState<CalculationType>("exclusive");
  const [isInterState, setIsInterState] = useState(false);
  const [result, setResult] = useState<GSTResult | null>(null);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateGST = () => {
    const amountValue = parseFloat(amount);
    const rateValue = parseFloat(gstRate);

    if (isNaN(amountValue) || amountValue <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

    let baseAmount: number;
    let gstAmount: number;
    let totalAmount: number;

    if (calculationType === "exclusive") {
      // GST Exclusive: Amount is base price, add GST
      baseAmount = amountValue;
      gstAmount = (baseAmount * rateValue) / 100;
      totalAmount = baseAmount + gstAmount;
    } else {
      // GST Inclusive: Amount includes GST, extract base
      totalAmount = amountValue;
      baseAmount = (totalAmount * 100) / (100 + rateValue);
      gstAmount = totalAmount - baseAmount;
    }

    const halfGst = gstAmount / 2;

    setResult({
      originalAmount: amountValue,
      baseAmount,
      gstAmount,
      cgst: isInterState ? 0 : halfGst,
      sgst: isInterState ? 0 : halfGst,
      igst: isInterState ? gstAmount : 0,
      totalAmount,
    });
  };

  return (
    <ToolLayout
      title="GST Calculator"
      description="Calculate GST (Goods and Services Tax) with CGST, SGST, and IGST breakdowns for Indian taxation."
      icon={Receipt}
      colorClass="bg-gradient-to-br from-amber-500 to-orange-600"
      category="Financial Tools"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label>GST Rate</Label>
            <Select value={gstRate} onValueChange={setGstRate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gstRates.map((rate) => (
                  <SelectItem key={rate.value} value={rate.value}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Calculation Type</Label>
            <Select value={calculationType} onValueChange={(v: CalculationType) => setCalculationType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exclusive">GST Exclusive (Add GST)</SelectItem>
                <SelectItem value="inclusive">GST Inclusive (Extract GST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="interstate"
            checked={isInterState}
            onChange={(e) => setIsInterState(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="interstate" className="cursor-pointer">
            Inter-State Supply (IGST instead of CGST + SGST)
          </Label>
        </div>

        <Button onClick={calculateGST} className="w-full" size="lg">
          <Calculator className="mr-2 h-4 w-4" />
          Calculate GST
        </Button>

        {result && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Base Amount (Excl. GST)</p>
                <p className="text-2xl font-bold">{formatCurrency(result.baseAmount)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">Total Amount (Incl. GST)</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(result.totalAmount)}</p>
              </div>
            </div>

            {/* GST Breakdown */}
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-semibold">GST Breakdown @ {gstRate}%</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Taxable Amount</span>
                  <span className="font-medium">{formatCurrency(result.baseAmount)}</span>
                </div>

                {isInterState ? (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">IGST ({gstRate}%)</span>
                    <span className="font-medium text-orange-500">{formatCurrency(result.igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">CGST ({parseFloat(gstRate) / 2}%)</span>
                      <span className="font-medium text-orange-500">{formatCurrency(result.cgst)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">SGST ({parseFloat(gstRate) / 2}%)</span>
                      <span className="font-medium text-orange-500">{formatCurrency(result.sgst)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total GST</span>
                  <span className="font-semibold text-orange-500">{formatCurrency(result.gstAmount)}</span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(result.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium mb-2">ℹ️ GST Info</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>CGST</strong>: Central GST (collected by Central Government)</li>
                <li>• <strong>SGST</strong>: State GST (collected by State Government)</li>
                <li>• <strong>IGST</strong>: Integrated GST (for inter-state transactions)</li>
              </ul>
            </div>
          </div>
        )}

        <ToolSEOContent
          toolName="GST Calculator"
          whatIs="GST (Goods and Services Tax) is a comprehensive indirect tax levied on the supply of goods and services in India. Our GST calculator helps you quickly compute the tax amount and final price for any transaction. Whether you need to add GST to a base price or extract GST from an inclusive amount, this tool provides accurate calculations with complete CGST, SGST, and IGST breakdowns based on whether the transaction is intra-state or inter-state."
          howToUse={[
            "Enter the amount you want to calculate GST for.",
            "Select the applicable GST rate (0%, 5%, 12%, 18%, or 28%).",
            "Choose whether the amount is GST exclusive (add GST) or inclusive (extract GST).",
            "Check 'Inter-State Supply' for IGST or leave unchecked for CGST+SGST."
          ]}
          features={[
            "Support for all standard GST rates in India.",
            "Calculate both GST exclusive and inclusive amounts.",
            "Complete breakdown of CGST, SGST, and IGST components.",
            "Handles intra-state and inter-state transactions.",
            "Instant results with detailed tax summary.",
            "Free to use with no registration required."
          ]}
          safetyNote="All calculations are performed locally in your browser. No transaction data is stored or transmitted. This calculator provides estimates for reference purposes. For official invoicing and compliance, please consult with a tax professional."
          faqs={[
            {
              question: "What is the difference between CGST, SGST, and IGST?",
              answer: "CGST (Central GST) and SGST (State GST) apply to intra-state transactions and are split equally. IGST (Integrated GST) applies to inter-state transactions and is collected by the central government."
            },
            {
              question: "Which GST rate applies to my product?",
              answer: "GST rates vary by product category: 0% for essentials, 5% for basic necessities, 12% for standard goods, 18% for most services, and 28% for luxury items. Check the official HSN/SAC codes for specific classifications."
            },
            {
              question: "How do I calculate GST for multiple items?",
              answer: "Calculate each item separately based on its applicable GST rate, then sum the totals. Different products may have different GST rates even in the same invoice."
            },
            {
              question: "Is GST applicable on all goods and services?",
              answer: "Most goods and services attract GST, but some essential items like fresh vegetables, healthcare services, and educational services are exempt or have 0% GST."
            }
          ]}
        />
      </div>
    </ToolLayout>
  );
}
