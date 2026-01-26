import { cn } from "@/lib/utils";

export type TemplateType = "modern" | "professional" | "minimal" | "creative" | "executive" | "technical" | "academic";
export type FontFamily = "inter" | "roboto" | "calibri" | "times" | "georgia";

export const templateConfig = {
  modern: {
    name: "Modern",
    headerBg: "bg-primary",
    headerText: "text-primary-foreground",
    accentColor: "text-primary",
    sectionStyle: "border-l-4 border-primary pl-4",
  },
  professional: {
    name: "Professional",
    headerBg: "bg-slate-800",
    headerText: "text-white",
    accentColor: "text-slate-700",
    sectionStyle: "border-b-2 border-slate-200 pb-2",
  },
  minimal: {
    name: "Minimal",
    headerBg: "bg-transparent",
    headerText: "text-foreground",
    accentColor: "text-muted-foreground",
    sectionStyle: "",
  },
  creative: {
    name: "Creative",
    headerBg: "bg-gradient-to-r from-pink-500 to-purple-600",
    headerText: "text-white",
    accentColor: "text-pink-600",
    sectionStyle: "rounded-lg bg-muted/30 p-3",
  },
  executive: {
    name: "Executive",
    headerBg: "bg-gradient-to-r from-amber-700 to-amber-900",
    headerText: "text-white",
    accentColor: "text-amber-700",
    sectionStyle: "border-b border-amber-200 pb-2",
  },
  technical: {
    name: "Technical",
    headerBg: "bg-gradient-to-r from-cyan-600 to-blue-700",
    headerText: "text-white",
    accentColor: "text-cyan-600",
    sectionStyle: "border-l-2 border-cyan-500 pl-3 bg-cyan-50/30 rounded-r",
  },
  academic: {
    name: "Academic",
    headerBg: "bg-gradient-to-r from-emerald-700 to-teal-800",
    headerText: "text-white",
    accentColor: "text-emerald-700",
    sectionStyle: "border-t border-emerald-200 pt-2",
  },
};

export const fontConfig: Record<FontFamily, { name: string; className: string }> = {
  inter: { name: "Inter", className: "font-sans" },
  roboto: { name: "Roboto", className: "font-sans" },
  calibri: { name: "Calibri", className: "font-sans" },
  times: { name: "Times New Roman", className: "font-serif" },
  georgia: { name: "Georgia", className: "font-serif" },
};

interface TemplateSelectorProps {
  selected: TemplateType;
  onSelect: (template: TemplateType) => void;
}

export const TemplateSelector = ({ selected, onSelect }: TemplateSelectorProps) => {
  const templates: TemplateType[] = ["modern", "professional", "minimal", "creative", "executive", "technical", "academic"];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {templates.map((template) => (
        <button
          key={template}
          onClick={() => onSelect(template)}
          className={cn(
            "p-3 rounded-lg border-2 transition-all text-sm font-medium",
            selected === template
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:border-primary/50"
          )}
        >
          {templateConfig[template].name}
        </button>
      ))}
    </div>
  );
};

interface FontSelectorProps {
  selected: FontFamily;
  onSelect: (font: FontFamily) => void;
}

export const FontSelector = ({ selected, onSelect }: FontSelectorProps) => {
  const fonts: FontFamily[] = ["inter", "roboto", "calibri", "times", "georgia"];

  return (
    <div className="flex flex-wrap gap-2">
      {fonts.map((font) => (
        <button
          key={font}
          onClick={() => onSelect(font)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm transition-all",
            fontConfig[font].className,
            selected === font
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {fontConfig[font].name}
        </button>
      ))}
    </div>
  );
};
