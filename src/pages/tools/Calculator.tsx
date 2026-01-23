import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon, Divide, X, Minus, Plus, Equal, Percent } from "lucide-react";
import { toast } from "sonner";
import ToolSEOContent from "@/components/ToolSEOContent";
import { CanonicalHead } from "@/components/CanonicalHead";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay("0");
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = parseFloat(previousValue);
      let result: number;

      switch (operation) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        case "*":
          result = currentValue * inputValue;
          break;
        case "/":
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          if (inputValue === 0) {
            toast.error("Cannot divide by zero");
            return;
          }
          break;
        default:
          result = inputValue;
      }

      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${result}`;
      setHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);
      setDisplay(String(result));
      setPreviousValue(String(result));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    const currentValue = parseFloat(previousValue);
    let result: number;

    switch (operation) {
      case "+":
        result = currentValue + inputValue;
        break;
      case "-":
        result = currentValue - inputValue;
        break;
      case "*":
        result = currentValue * inputValue;
        break;
      case "/":
        if (inputValue === 0) {
          toast.error("Cannot divide by zero");
          return;
        }
        result = currentValue / inputValue;
        break;
      default:
        return;
    }

    const historyEntry = `${currentValue} ${operation} ${inputValue} = ${result}`;
    setHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const percentage = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
  };

  const toggleSign = () => {
    const value = parseFloat(display) * -1;
    setDisplay(String(value));
  };

  const buttonClass = "h-14 text-lg font-semibold transition-all hover:scale-105";

  const seoContent = {
    toolName: "Calculator",
    whatIs: "Calculator is a free online tool that provides a clean, easy-to-use interface for performing mathematical calculations. Whether you need to do simple arithmetic like addition, subtraction, multiplication, and division, or calculate percentages and toggle between positive and negative numbers, this calculator handles it all. It also keeps a history of your recent calculations for easy reference.",
    howToUse: [
      "Enter numbers using the on-screen buttons or your keyboard.",
      "Select an operation (+, -, ×, ÷) to perform.",
      "Press the equals button (=) to see the result.",
      "Use AC to clear all or CE to clear just the current entry.",
      "Use % for percentage calculations and +/- to toggle between positive and negative."
    ],
    features: [
      "Basic arithmetic: addition, subtraction, multiplication, division",
      "Percentage calculations",
      "Positive/negative toggle",
      "Calculation history with last 10 operations",
      "Clear all (AC) and clear entry (CE) functions",
      "Clean, responsive design that works on all devices"
    ],
    safetyNote: "This calculator runs entirely in your browser with no data sent to any server. Your calculations are performed locally and the history is stored only in your current session, ensuring complete privacy.",
    faqs: [
      { question: "What's the difference between AC and CE?", answer: "AC (All Clear) resets the entire calculator, clearing the display, any stored values, and pending operations. CE (Clear Entry) only clears the current number being entered, leaving any previous calculations intact." },
      { question: "How do I calculate percentages?", answer: "Enter a number and press the % button to convert it to a percentage (divide by 100). For example, entering 50 and pressing % gives you 0.5." },
      { question: "Does the calculator save my history?", answer: "The calculator keeps a history of your last 10 calculations during your current session. This history is cleared when you close or refresh the page." },
      { question: "Can I use keyboard input?", answer: "Currently, the calculator is optimized for on-screen button input. Keyboard support may be added in future updates." }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="Online Calculator Free - Scientific Calculator | Mypdfs"
        description="Free online calculator with history. Perform basic and advanced calculations. Easy to use scientific calculator."
        keywords="calculator, online calculator, free calculator, math calculator, scientific calculator"
      />
      <ToolLayout
        title="Calculator"
        description="A powerful calculator for all your mathematical needs"
        icon={CalcIcon}
        colorClass="bg-indigo-500"
      >
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="bg-muted rounded-xl p-4 mb-4">
            <div className="text-right text-sm text-muted-foreground h-6">
              {previousValue && operation && `${previousValue} ${operation}`}
            </div>
            <div className="text-right text-4xl font-bold text-foreground truncate">
              {display}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button variant="secondary" className={buttonClass} onClick={clear}>
              AC
            </Button>
            <Button variant="secondary" className={buttonClass} onClick={clearEntry}>
              CE
            </Button>
            <Button variant="secondary" className={buttonClass} onClick={percentage}>
              <Percent className="w-5 h-5" />
            </Button>
            <Button variant="default" className={`${buttonClass} bg-orange-500 hover:bg-orange-600`} onClick={() => performOperation("/")}>
              <Divide className="w-5 h-5" />
            </Button>

            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("7")}>7</Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("8")}>8</Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("9")}>9</Button>
            <Button variant="default" className={`${buttonClass} bg-orange-500 hover:bg-orange-600`} onClick={() => performOperation("*")}>
              <X className="w-5 h-5" />
            </Button>

            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("4")}>4</Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("5")}>5</Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("6")}>6</Button>
            <Button variant="default" className={`${buttonClass} bg-orange-500 hover:bg-orange-600`} onClick={() => performOperation("-")}>
              <Minus className="w-5 h-5" />
            </Button>

            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("1")}>1</Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("2")}>2</Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("3")}>3</Button>
            <Button variant="default" className={`${buttonClass} bg-orange-500 hover:bg-orange-600`} onClick={() => performOperation("+")}>
              <Plus className="w-5 h-5" />
            </Button>

            <Button variant="outline" className={buttonClass} onClick={toggleSign}>+/-</Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("0")}>0</Button>
            <Button variant="outline" className={buttonClass} onClick={inputDecimal}>.</Button>
            <Button variant="default" className={`${buttonClass} bg-green-500 hover:bg-green-600`} onClick={calculate}>
              <Equal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">History</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <p key={index} className="text-sm text-muted-foreground font-mono">
                  {entry}
                </p>
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
