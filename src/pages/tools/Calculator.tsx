import { useState, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { 
  Calculator as CalcIcon, 
  Divide, 
  X, 
  Minus, 
  Plus, 
  Equal, 
  Percent,
  Copy,
  Trash2,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import ToolSEOContent from "@/components/ToolSEOContent";
import { CanonicalHead } from "@/components/CanonicalHead";
import { cn } from "@/lib/utils";
import {
  initialState,
  inputDigit,
  inputDecimal,
  clear,
  clearEntry,
  backspace,
  percentage,
  toggleSign,
  squareRoot,
  square,
  reciprocal,
  performOperation,
  calculate,
  type CalculatorState,
  type Operation,
} from "@/lib/calculator";

const Calculator = () => {
  const [state, setState] = useState<CalculatorState>(initialState);
  const [history, setHistory] = useState<string[]>([]);

  const handleDigit = useCallback((digit: string) => {
    setState(prev => inputDigit(prev, digit));
  }, []);

  const handleDecimal = useCallback(() => {
    setState(prev => inputDecimal(prev));
  }, []);

  const handleClear = useCallback(() => {
    setState(clear());
  }, []);

  const handleClearEntry = useCallback(() => {
    setState(prev => clearEntry(prev));
  }, []);

  const handleBackspace = useCallback(() => {
    setState(prev => backspace(prev));
  }, []);

  const handlePercentage = useCallback(() => {
    setState(prev => percentage(prev));
  }, []);

  const handleToggleSign = useCallback(() => {
    setState(prev => toggleSign(prev));
  }, []);

  const handleSquareRoot = useCallback(() => {
    const result = squareRoot(state);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      setState(result);
    }
  }, [state]);

  const handleSquare = useCallback(() => {
    setState(prev => square(prev));
  }, []);

  const handleReciprocal = useCallback(() => {
    const result = reciprocal(state);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      setState(result);
    }
  }, [state]);

  const handleOperation = useCallback((op: Operation) => {
    const result = performOperation(state, op);
    if ('state' in result) {
      setState(result.state);
      if (result.historyEntry) {
        setHistory(prev => [result.historyEntry, ...prev.slice(0, 19)]);
      }
    } else {
      setState(result);
    }
  }, [state]);

  const handleCalculate = useCallback(() => {
    const result = calculate(state);
    if ('error' in result) {
      toast.error(result.error);
    } else if ('state' in result) {
      setState(result.state);
      if (result.historyEntry) {
        setHistory(prev => [result.historyEntry, ...prev.slice(0, 19)]);
      }
    }
  }, [state]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.display);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  }, [state.display]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    toast.success("History cleared");
  }, []);

  const reuseHistoryResult = useCallback((entry: string) => {
    const match = entry.match(/= (.+)$/);
    if (match) {
      setState({
        ...initialState,
        display: match[1],
      });
      toast.success("Result loaded");
    }
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for calculator keys
      if (/^[0-9+\-*/=.%]$/.test(e.key) || 
          ['Enter', 'Backspace', 'Escape', 'Delete'].includes(e.key)) {
        e.preventDefault();
      }

      // Digits
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
        return;
      }

      // Operators
      switch (e.key) {
        case '+':
          handleOperation('+');
          break;
        case '-':
          handleOperation('-');
          break;
        case '*':
          handleOperation('*');
          break;
        case '/':
          handleOperation('/');
          break;
        case '^':
          handleOperation('^');
          break;
        case '.':
        case ',':
          handleDecimal();
          break;
        case '=':
        case 'Enter':
          handleCalculate();
          break;
        case 'Backspace':
          handleBackspace();
          break;
        case 'Escape':
          handleClear();
          break;
        case 'Delete':
          handleClearEntry();
          break;
        case '%':
          handlePercentage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleOperation, handleDecimal, handleCalculate, handleBackspace, handleClear, handleClearEntry, handlePercentage]);

  const buttonClass = "h-12 sm:h-14 text-base sm:text-lg font-semibold transition-all duration-150 active:scale-95 hover:scale-[1.02] focus:ring-2 focus:ring-primary/50";

  const seoContent = {
    toolName: "Scientific Calculator",
    whatIs: "Scientific Calculator is a free online tool that provides a clean, easy-to-use interface for performing mathematical calculations. Whether you need to do simple arithmetic like addition, subtraction, multiplication, and division, or advanced operations like square roots, powers, and reciprocals, this calculator handles it all. It also keeps a history of your last 20 calculations for easy reference and supports full keyboard input.",
    howToUse: [
      "Enter numbers using the on-screen buttons or your keyboard.",
      "Select an operation (+, -, ×, ÷, ^) to perform.",
      "Use scientific functions: √ for square root, x² for square, 1/x for reciprocal.",
      "Press the equals button (=) or Enter to see the result.",
      "Use AC to clear all, CE to clear current entry, or Backspace to delete last digit.",
      "Use % for percentage calculations and +/- to toggle between positive and negative.",
      "Copy results with the copy button and reuse previous calculations from history."
    ],
    features: [
      "Basic arithmetic: addition, subtraction, multiplication, division",
      "Scientific operations: square root, square, power, reciprocal",
      "Percentage calculations and positive/negative toggle",
      "Full keyboard support with number keys, operators, Enter, and Backspace",
      "Calculation history with last 20 operations and reuse capability",
      "Copy result to clipboard with one click",
      "Auto operator correction for smoother input",
      "Responsive design optimized for mobile and desktop",
      "Light and dark mode support with system preference detection",
      "Safe handling of large numbers and division by zero"
    ],
    safetyNote: "This calculator runs entirely in your browser with no data sent to any server. Your calculations are performed locally and the history is stored only in your current session, ensuring complete privacy.",
    faqs: [
      { question: "What's the difference between AC and CE?", answer: "AC (All Clear) resets the entire calculator, clearing the display, any stored values, and pending operations. CE (Clear Entry) only clears the current number being entered, leaving any previous calculations intact." },
      { question: "How do I calculate powers like 2^10?", answer: "Enter the base number (2), press the xʸ button, enter the exponent (10), and press equals. You can also use the ^ key on your keyboard." },
      { question: "What keyboard shortcuts are supported?", answer: "Numbers 0-9 for digits, +, -, *, / for operations, Enter or = for calculate, Backspace to delete, Escape to clear all, Delete to clear entry, . or , for decimal, and % for percentage." },
      { question: "How do I reuse a previous result?", answer: "Click on any entry in the calculation history to load that result into the display for further calculations." },
      { question: "Does the calculator handle very large or small numbers?", answer: "Yes! The calculator automatically formats very large or very small numbers in scientific notation (e.g., 1.5e+20) to ensure accurate display." }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="Online Scientific Calculator Free - Advanced Calculator | Mypdfs"
        description="Free online scientific calculator with history, keyboard support, and advanced functions. Perform basic and scientific calculations with ease."
        keywords="calculator, online calculator, free calculator, math calculator, scientific calculator, advanced calculator"
      />
      <ToolLayout
        title="Scientific Calculator"
        description="A powerful scientific calculator for all your mathematical needs"
        icon={CalcIcon}
        colorClass="bg-indigo-500"
      >
        <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
          {/* Calculator Body */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg">
            {/* Display */}
            <div className="bg-muted rounded-xl p-3 sm:p-4 mb-4">
              <div className="text-right text-xs sm:text-sm text-muted-foreground h-5 sm:h-6 truncate">
                {state.previousValue && state.operation && `${state.previousValue} ${state.operation}`}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div 
                  className={cn(
                    "flex-1 text-right text-2xl sm:text-4xl font-bold overflow-x-auto scrollbar-none whitespace-nowrap",
                    state.error ? "text-destructive" : "text-foreground"
                  )}
                >
                  {state.display}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-60 hover:opacity-100"
                  onClick={handleCopy}
                  aria-label="Copy result"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scientific Row */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Button 
                variant="outline" 
                className={cn(buttonClass, "text-sm")} 
                onClick={handleSquareRoot}
                aria-label="Square root"
              >
                √
              </Button>
              <Button 
                variant="outline" 
                className={cn(buttonClass, "text-sm")} 
                onClick={handleSquare}
                aria-label="Square"
              >
                x²
              </Button>
              <Button 
                variant="outline" 
                className={cn(buttonClass, "text-sm")} 
                onClick={() => handleOperation('^')}
                aria-label="Power"
              >
                xʸ
              </Button>
              <Button 
                variant="outline" 
                className={cn(buttonClass, "text-sm")} 
                onClick={handleReciprocal}
                aria-label="Reciprocal"
              >
                1/x
              </Button>
            </div>

            {/* Main Buttons */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              <Button variant="secondary" className={buttonClass} onClick={handleClear}>
                AC
              </Button>
              <Button variant="secondary" className={buttonClass} onClick={handleClearEntry}>
                CE
              </Button>
              <Button variant="secondary" className={buttonClass} onClick={handlePercentage}>
                <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button 
                variant="default" 
                className={cn(buttonClass, "bg-orange-500 hover:bg-orange-600")} 
                onClick={() => handleOperation("/")}
              >
                <Divide className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("7")}>7</Button>
              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("8")}>8</Button>
              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("9")}>9</Button>
              <Button 
                variant="default" 
                className={cn(buttonClass, "bg-orange-500 hover:bg-orange-600")} 
                onClick={() => handleOperation("*")}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("4")}>4</Button>
              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("5")}>5</Button>
              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("6")}>6</Button>
              <Button 
                variant="default" 
                className={cn(buttonClass, "bg-orange-500 hover:bg-orange-600")} 
                onClick={() => handleOperation("-")}
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("1")}>1</Button>
              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("2")}>2</Button>
              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("3")}>3</Button>
              <Button 
                variant="default" 
                className={cn(buttonClass, "bg-orange-500 hover:bg-orange-600")} 
                onClick={() => handleOperation("+")}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              <Button variant="outline" className={buttonClass} onClick={handleToggleSign}>+/-</Button>
              <Button variant="outline" className={buttonClass} onClick={() => handleDigit("0")}>0</Button>
              <Button variant="outline" className={buttonClass} onClick={handleDecimal}>.</Button>
              <Button 
                variant="default" 
                className={cn(buttonClass, "bg-green-500 hover:bg-green-600")} 
                onClick={handleCalculate}
              >
                <Equal className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            {/* Backspace hint */}
            <p className="text-center text-xs text-muted-foreground mt-3">
              Tip: Use keyboard for quick input (0-9, +, -, *, /, Enter, Backspace)
            </p>
          </div>

          {/* History Panel */}
          {history.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {history.map((entry, index) => (
                  <button
                    key={index}
                    className="w-full text-left text-sm text-muted-foreground font-mono p-2 rounded hover:bg-muted transition-colors flex items-center justify-between group"
                    onClick={() => reuseHistoryResult(entry)}
                  >
                    <span className="truncate">{entry}</span>
                    <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default Calculator;
