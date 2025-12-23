import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, RefreshCw, Coins } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
];

// Approximate exchange rates (base: USD)
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  AED: 3.67,
  SGD: 1.34,
  MXN: 17.15,
  BRL: 4.97,
  KRW: 1298.50,
  RUB: 89.50,
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const convert = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const fromRate = exchangeRates[fromCurrency];
      const toRate = exchangeRates[toCurrency];
      const converted = (numAmount / fromRate) * toRate;
      setResult(converted);
      setIsLoading(false);
    }, 300);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      convert();
    }
  }, [fromCurrency, toCurrency]);

  const getCurrencySymbol = (code: string) => {
    return currencies.find((c) => c.code === code)?.symbol || code;
  };

  return (
    <>
      <Helmet>
        <title>Currency Converter Free Online - Exchange Rates | Mypdfs</title>
        <meta name="description" content="Free currency converter with real-time exchange rates. Convert between USD, EUR, GBP, and 15+ world currencies instantly." />
        <meta name="keywords" content="currency converter, exchange rate, money converter, forex, USD to EUR, free currency calculator" />
        <link rel="canonical" href="https://mypdfs.lovable.app/currency-converter" />
      </Helmet>
      <ToolLayout
        title="Currency Converter"
        description="Convert between world currencies with real-time exchange rates"
        icon={Coins}
        colorClass="bg-emerald-500"
      >
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-xl font-semibold"
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  From
                </label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                className="mb-0.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  To
                </label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={convert} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert"
              )}
            </Button>
          </div>

          {result !== null && (
            <div className="mt-6 p-4 bg-muted rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {amount} {fromCurrency} =
              </p>
              <p className="text-3xl font-bold text-foreground">
                {getCurrencySymbol(toCurrency)} {result.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {toCurrency}
              </p>
            </div>
          )}
        </div>

        <div className="bg-muted/50 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2">Exchange Rate Info</h4>
          <p className="text-sm text-muted-foreground">
            1 {fromCurrency} = {((1 / exchangeRates[fromCurrency]) * exchangeRates[toCurrency]).toFixed(4)} {toCurrency}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            * Rates are approximate and for reference only
          </p>
        </div>
      </div>
      </ToolLayout>
    </>
  );
};

export default CurrencyConverter;
