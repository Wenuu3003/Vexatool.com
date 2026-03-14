import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { Heart, Scale, Cake, Percent, Calculator, DollarSign } from "lucide-react";
import calculatorVisual from "@/assets/graphics/calculator-tools-visual.webp";

const tools = [
  { name: "Scientific Calculator", href: "/calculator", icon: Calculator, desc: "Full-featured scientific calculator online", gradient: "from-blue-500 to-indigo-500" },
  { name: "Love Calculator", href: "/love-calculator", icon: Heart, desc: "Calculate love compatibility with zodiac and numerology", gradient: "from-pink-500 to-rose-500" },
  { name: "BMI Calculator", href: "/bmi-calculator", icon: Scale, desc: "Calculate your Body Mass Index with health recommendations", gradient: "from-red-400 to-pink-500" },
  { name: "Age Calculator", href: "/age-calculator", icon: Cake, desc: "Calculate your exact age in years, months and days", gradient: "from-violet-500 to-purple-600" },
  { name: "Percentage Calculator", href: "/percentage-calculator", icon: Percent, desc: "Calculate percentages, changes, increases and decreases", gradient: "from-green-500 to-emerald-500" },
  { name: "EMI Calculator", href: "/emi-calculator", icon: Percent, desc: "Calculate loan EMI, interest and monthly payments", gradient: "from-emerald-500 to-teal-500" },
  { name: "GST Calculator", href: "/gst-calculator", icon: Percent, desc: "Calculate GST amount, net and gross price instantly", gradient: "from-orange-500 to-amber-500" },
  { name: "Currency Converter", href: "/currency-converter", icon: DollarSign, desc: "Convert currencies with live exchange rates", gradient: "from-yellow-500 to-amber-600" },
];

const faqs = [
  { q: "Are these calculators accurate?", a: "Yes. Every calculator uses standard mathematical formulas and industry-accepted methods. The EMI calculator follows the reducing balance method used by banks." },
  { q: "Can I use the EMI calculator for home loans?", a: "Absolutely. Enter your loan amount, interest rate, and tenure to see exact monthly payments, total interest, and an amortization breakdown." },
  { q: "How does the Love Calculator work?", a: "It uses a combination of numerology (name letter values) and zodiac compatibility to generate a fun compatibility score. It's designed for entertainment, not relationship advice." },
  { q: "Is the BMI calculator suitable for all ages?", a: "The BMI calculator uses the standard formula suitable for adults. For children and teenagers, BMI calculations require age-specific percentile charts." },
  { q: "Do I need to create an account?", a: "No. All calculators work instantly without any registration, login, or personal data collection." },
];

const CalculatorTools = () => {
  return (
    <div className="min-h-screen bg-background">
      <CanonicalHead
        title="Free Online Calculators – BMI, EMI, Age, Love & Percentage Calculator | VexaTool"
        description="Use VexaTool's free online calculators for BMI, EMI, age, love compatibility, and percentage calculations. Fast, accurate and easy to use."
        keywords="online calculator, BMI calculator, EMI calculator, age calculator, love calculator, percentage calculator, free calculator"
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Free Online Calculators</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          Quick, accurate calculations for health, finance, and everyday math. No signup, instant results.
        </p>

        {/* Tool Grid — near the top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href} className="group p-5 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
                  <tool.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{tool.desc}</p>
            </Link>
          ))}
        </div>

        {/* Content + Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Practical Calculators for Everyday Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our EMI calculator helps you plan home loans, car loans, and personal loans by showing exact monthly payments and total interest. The BMI calculator gives you a clear health category based on your height and weight.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The age calculator computes your precise age down to days — perfect for official forms and birthday celebrations. The percentage calculator handles everything from simple calculations to percentage increase and decrease.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={calculatorVisual}
              alt="Calculator tools showing BMI gauge, scientific calculator, bar chart and percentage functions"
              className="w-full max-w-sm rounded-xl shadow-lg border border-border/40"
              loading="lazy"
              decoding="async"
              width={400}
              height={256}
            />
          </div>
        </div>

        {/* Additional content */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Accurate, Instant, and Free</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every calculator runs directly in your browser, providing instant results. There are no ads blocking your view, no forced registrations, and no limits on calculations. The tools are designed with accuracy in mind, using standard mathematical formulas and industry-accepted methods.
          </p>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CalculatorTools;
