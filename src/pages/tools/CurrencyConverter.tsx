import { useState, useEffect, useCallback, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, RefreshCw, Coins } from "lucide-react";
import { toast } from "sonner";
import ToolSEOContent from "@/components/ToolSEOContent";
import { CanonicalHead } from "@/components/CanonicalHead";

import { parseRates, convertAmount } from '@/lib/currencyRates';

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

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [rateError, setRateError] = useState("");
  const request = useRef<AbortController | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);

  const fetchExchangeRates = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setRatesLoading(true);
    setExchangeRates(null);
    setLastUpdated(null);
    setRateError("");
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { signal: controller.signal });
      if (!response.ok) throw new Error('Rate provider unavailable');
      const data = parseRates(await response.json());
      if (request.current !== controller) return;
      setExchangeRates(data.rates);
      setLastUpdated(data.date);
    } catch {
      if (request.current === controller) setRateError('Exchange rates are unavailable. Retry to fetch provider rates; no fallback rates are used.');
    } finally {
      clearTimeout(timer);
      if (request.current === controller) setRatesLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchExchangeRates();
    return () => { const pending = request.current; request.current = null; pending?.abort(); };
  }, [fetchExchangeRates]);
  const result = convertAmount(amount, fromCurrency, toCurrency, exchangeRates);
  const convert = () => { if (result === null) toast.error('Enter a finite non-negative amount and choose currencies with available rates.'); };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);

  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find((c) => c.code === code)?.symbol || code;
  };

  const getExchangeRate = () => {
    const rate = convertAmount('1', fromCurrency, toCurrency, exchangeRates);
    return rate === null ? 'Unavailable' : rate.toFixed(4);
  };

  return (
    <>
      <CanonicalHead
        title="Currency Converter Free Online - Exchange Rates | VexaTool"
        description="Free currency converter with provider-published exchange rates. Convert between USD, EUR, GBP, and 15+ world currencies."
        keywords="currency converter, exchange rate, money converter, forex, USD to EUR, free currency calculator"
      />
      <ToolLayout
        title="Currency Converter"
        description="Convert between world currencies with provider-published exchange rates"
        icon={Coins}
        colorClass="bg-emerald-500"
      >
      <div className="max-w-xl mx-auto space-y-6">
        {rateError && <p role="alert" className="text-destructive">{rateError}</p>}
        {!ratesLoading && exchangeRates && result === null && <p role="status">Enter a valid amount and select currencies with available rates.</p>}
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

            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 items-end">
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
                aria-label="Swap currencies" onClick={swapCurrencies}
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

            <div className="flex gap-2">
              <Button onClick={convert} className="flex-1" disabled={ratesLoading || result === null}>
                Convert
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchExchangeRates} 
                disabled={ratesLoading}
                title="Refresh rates"
              >
                <RefreshCw className={`w-4 h-4 ${ratesLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
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
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-foreground">Reference Exchange Rate</h4>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Provider date: {lastUpdated}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            1 {fromCurrency} = {getExchangeRate()} {toCurrency}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Reference rates from ExchangeRate-API for the provider date shown. Bank rates and fees may differ.
          </p>
        </div>

        <ToolSEOContent
          toolName="Currency Converter"
          whatIs="A currency converter helps you quickly calculate the value of one currency in terms of another. Whether you are traveling abroad, making international purchases, or managing foreign investments, knowing the current exchange rate is essential. Our free currency converter supports major world currencies including USD, EUR, GBP, JPY, INR, and more, providing instant conversions with approximate exchange rates for your reference."
          howToUse={[
            "Enter the amount you want to convert.",
            "Select the source currency (From).",
            "Select the target currency (To).",
            "Click 'Convert' to see the converted amount."
          ]}
          features={[
            "Support for 10 major world currencies.",
            "Quick swap button to reverse conversion direction.",
            "Shows current exchange rate for your reference.",
            "Clean, easy-to-use interface.",
            "Instant calculations with no delays.",
            "Free to use with no registration required."
          ]}
          safetyNote="All conversions are calculated locally in your browser. No personal or financial data is transmitted or stored. Reference exchange rates are requested from ExchangeRate-API; entered amounts are not included in that request."
          faqs={[
            {
              question: "Are these exchange rates live?",
              answer: "These are provider-published reference rates, not a real-time market feed. Check the provider date. If retrieval fails, conversion is unavailable until a successful refresh."
            },
            {
              question: "Why do exchange rates change?",
              answer: "Currency values fluctuate based on economic factors, interest rates, inflation, political stability, and market supply and demand. Rates can change multiple times per day."
            },
            {
              question: "Should I use this for financial decisions?",
              answer: "This tool provides estimates for planning and reference. For actual transactions involving significant amounts, always verify current rates with your bank or exchange service."
            },
            {
              question: "What currencies are supported?",
              answer: "We support major currencies including US Dollar (USD), Euro (EUR), British Pound (GBP), Japanese Yen (JPY), Indian Rupee (INR), Australian Dollar (AUD), Canadian Dollar (CAD), Swiss Franc (CHF), Chinese Yuan (CNY), and Singapore Dollar (SGD)."
            }
          ]}
        />
      </div>
      </ToolLayout>
    </>
  );
};

export default CurrencyConverter;
