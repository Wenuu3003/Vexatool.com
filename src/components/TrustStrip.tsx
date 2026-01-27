import { Globe, ShieldCheck, Zap, Smartphone } from "lucide-react";
const benefits = [{
  icon: Globe,
  title: "Browser-Based",
  description: "Works entirely in your browser"
}, {
  icon: ShieldCheck,
  title: "No Files Stored",
  description: "Your files stay private"
}, {
  icon: Zap,
  title: "Fast Processing",
  description: "Instant results every time"
}, {
  icon: Smartphone,
  title: "Mobile Friendly",
  description: "Works on any device"
}];
export const TrustStrip = () => {
  return <section className="py-8 border-y border-border bg-[#fee6e6]" aria-label="Platform benefits">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {benefits.map(benefit => <div key={benefit.title} className="flex flex-col items-center text-center gap-2 p-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground text-sm md:text-base">
                {benefit.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>)}
        </div>
      </div>
    </section>;
};