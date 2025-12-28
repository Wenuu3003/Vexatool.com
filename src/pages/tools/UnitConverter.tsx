import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = {
  length: {
    name: "Length",
    units: [
      { value: "m", label: "Meter (m)", factor: 1 },
      { value: "km", label: "Kilometer (km)", factor: 1000 },
      { value: "cm", label: "Centimeter (cm)", factor: 0.01 },
      { value: "mm", label: "Millimeter (mm)", factor: 0.001 },
      { value: "mi", label: "Mile (mi)", factor: 1609.344 },
      { value: "yd", label: "Yard (yd)", factor: 0.9144 },
      { value: "ft", label: "Foot (ft)", factor: 0.3048 },
      { value: "in", label: "Inch (in)", factor: 0.0254 },
    ],
  },
  weight: {
    name: "Weight",
    units: [
      { value: "kg", label: "Kilogram (kg)", factor: 1 },
      { value: "g", label: "Gram (g)", factor: 0.001 },
      { value: "mg", label: "Milligram (mg)", factor: 0.000001 },
      { value: "lb", label: "Pound (lb)", factor: 0.453592 },
      { value: "oz", label: "Ounce (oz)", factor: 0.0283495 },
      { value: "t", label: "Metric Ton (t)", factor: 1000 },
    ],
  },
  temperature: {
    name: "Temperature",
    units: [
      { value: "c", label: "Celsius (°C)", factor: 1 },
      { value: "f", label: "Fahrenheit (°F)", factor: 1 },
      { value: "k", label: "Kelvin (K)", factor: 1 },
    ],
  },
  area: {
    name: "Area",
    units: [
      { value: "sqm", label: "Square Meter (m²)", factor: 1 },
      { value: "sqkm", label: "Square Kilometer (km²)", factor: 1000000 },
      { value: "sqft", label: "Square Foot (ft²)", factor: 0.092903 },
      { value: "sqyd", label: "Square Yard (yd²)", factor: 0.836127 },
      { value: "acre", label: "Acre", factor: 4046.86 },
      { value: "ha", label: "Hectare (ha)", factor: 10000 },
    ],
  },
  volume: {
    name: "Volume",
    units: [
      { value: "l", label: "Liter (L)", factor: 1 },
      { value: "ml", label: "Milliliter (mL)", factor: 0.001 },
      { value: "gal", label: "Gallon (US)", factor: 3.78541 },
      { value: "qt", label: "Quart (US)", factor: 0.946353 },
      { value: "pt", label: "Pint (US)", factor: 0.473176 },
      { value: "cup", label: "Cup (US)", factor: 0.236588 },
      { value: "floz", label: "Fluid Ounce (US)", factor: 0.0295735 },
      { value: "m3", label: "Cubic Meter (m³)", factor: 1000 },
    ],
  },
  speed: {
    name: "Speed",
    units: [
      { value: "mps", label: "Meters/second (m/s)", factor: 1 },
      { value: "kmh", label: "Kilometers/hour (km/h)", factor: 0.277778 },
      { value: "mph", label: "Miles/hour (mph)", factor: 0.44704 },
      { value: "kn", label: "Knots (kn)", factor: 0.514444 },
      { value: "fps", label: "Feet/second (ft/s)", factor: 0.3048 },
    ],
  },
  time: {
    name: "Time",
    units: [
      { value: "s", label: "Second (s)", factor: 1 },
      { value: "ms", label: "Millisecond (ms)", factor: 0.001 },
      { value: "min", label: "Minute (min)", factor: 60 },
      { value: "h", label: "Hour (h)", factor: 3600 },
      { value: "d", label: "Day (d)", factor: 86400 },
      { value: "wk", label: "Week (wk)", factor: 604800 },
      { value: "mo", label: "Month (mo)", factor: 2629800 },
      { value: "yr", label: "Year (yr)", factor: 31557600 },
    ],
  },
  data: {
    name: "Data Storage",
    units: [
      { value: "b", label: "Byte (B)", factor: 1 },
      { value: "kb", label: "Kilobyte (KB)", factor: 1024 },
      { value: "mb", label: "Megabyte (MB)", factor: 1048576 },
      { value: "gb", label: "Gigabyte (GB)", factor: 1073741824 },
      { value: "tb", label: "Terabyte (TB)", factor: 1099511627776 },
    ],
  },
};

type CategoryKey = keyof typeof categories;

export default function UnitConverter() {
  const [category, setCategory] = useState<CategoryKey>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("");
  const { toast } = useToast();

  const currentCategory = categories[category];

  const convert = (value: string, from: string, to: string, cat: CategoryKey): string => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "";

    if (cat === "temperature") {
      return convertTemperature(numValue, from, to);
    }

    const fromFactor = categories[cat].units.find((u) => u.value === from)?.factor || 1;
    const toFactor = categories[cat].units.find((u) => u.value === to)?.factor || 1;

    const baseValue = numValue * fromFactor;
    const result = baseValue / toFactor;

    return formatResult(result);
  };

  const convertTemperature = (value: number, from: string, to: string): string => {
    let celsius: number;

    // Convert to Celsius first
    switch (from) {
      case "c":
        celsius = value;
        break;
      case "f":
        celsius = (value - 32) * (5 / 9);
        break;
      case "k":
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    // Convert from Celsius to target
    let result: number;
    switch (to) {
      case "c":
        result = celsius;
        break;
      case "f":
        result = celsius * (9 / 5) + 32;
        break;
      case "k":
        result = celsius + 273.15;
        break;
      default:
        result = celsius;
    }

    return formatResult(result);
  };

  const formatResult = (value: number): string => {
    if (Math.abs(value) < 0.0001 && value !== 0) {
      return value.toExponential(6);
    }
    if (Math.abs(value) >= 1000000) {
      return value.toExponential(6);
    }
    return value.toLocaleString("en-US", { maximumFractionDigits: 10 });
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    setToValue(convert(value, fromUnit, toUnit, category));
  };

  const handleToValueChange = (value: string) => {
    setToValue(value);
    setFromValue(convert(value, toUnit, fromUnit, category));
  };

  const handleCategoryChange = (newCategory: CategoryKey) => {
    setCategory(newCategory);
    const units = categories[newCategory].units;
    setFromUnit(units[0].value);
    setToUnit(units[1]?.value || units[0].value);
    setFromValue("1");
    setToValue(convert("1", units[0].value, units[1]?.value || units[0].value, newCategory));
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    const tempValue = fromValue;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(tempValue);
  };

  // Initialize
  useMemo(() => {
    setToValue(convert(fromValue, fromUnit, toUnit, category));
  }, []);

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert between different units of measurement including length, weight, temperature, area, volume, and more."
      icon={ArrowRightLeft}
      colorClass="bg-gradient-to-br from-teal-500 to-cyan-600"
      category="Utility Tools"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categories).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* From */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>From</Label>
              <Select
                value={fromUnit}
                onValueChange={(value) => {
                  setFromUnit(value);
                  setToValue(convert(fromValue, value, toUnit, category));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentCategory.units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="number"
              value={fromValue}
              onChange={(e) => handleFromValueChange(e.target.value)}
              placeholder="Enter value"
              className="text-lg"
            />
          </div>

          {/* Swap Button */}
          <div className="flex items-end justify-center sm:hidden">
            <Button variant="outline" size="icon" onClick={swapUnits}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* To */}
          <div className="space-y-3">
            <div className="space-y-2 flex items-center gap-2">
              <div className="flex-1">
                <Label>To</Label>
                <Select
                  value={toUnit}
                  onValueChange={(value) => {
                    setToUnit(value);
                    setToValue(convert(fromValue, fromUnit, value, category));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCategory.units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" onClick={swapUnits} className="hidden sm:flex mt-6">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Input
              type="number"
              value={toValue}
              onChange={(e) => handleToValueChange(e.target.value)}
              placeholder="Result"
              className="text-lg"
            />
          </div>
        </div>

        {/* Conversion Formula */}
        {fromValue && toValue && (
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-lg">
              <span className="font-semibold">{fromValue}</span>{" "}
              <span className="text-muted-foreground">
                {currentCategory.units.find((u) => u.value === fromUnit)?.label}
              </span>{" "}
              ={" "}
              <span className="font-semibold text-primary">{toValue}</span>{" "}
              <span className="text-muted-foreground">
                {currentCategory.units.find((u) => u.value === toUnit)?.label}
              </span>
            </p>
          </div>
        )}

        {/* Quick Reference */}
        <div className="rounded-lg border p-4">
          <h4 className="font-semibold mb-3">Quick Reference ({currentCategory.name})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {currentCategory.units.slice(0, 6).map((unit) => (
              <div key={unit.value} className="text-muted-foreground">
                {unit.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
