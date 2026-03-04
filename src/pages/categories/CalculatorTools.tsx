import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { Heart, Scale, Cake, Percent, Calculator, DollarSign } from "lucide-react";

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
        <h1 className="text-4xl font-bold text-foreground mb-6">Free Online Calculators</h1>
        
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-muted-foreground leading-relaxed">
            Whether you are planning your finances, checking your health metrics, or just having fun with a love compatibility test, VexaTool has a calculator for every situation. Our collection of free online calculators is designed to give you quick, accurate results without any complicated setup.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            From students calculating percentages for their exams to professionals planning loan repayments, these tools serve a wide range of practical needs. Each calculator is built with a clean interface that works smoothly on both desktop and mobile devices, so you can get your answers anytime, anywhere.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Practical Calculators for Everyday Use</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our EMI calculator helps you plan home loans, car loans, and personal loans by showing you exact monthly payments and total interest. The BMI calculator gives you a clear picture of your health category based on your height and weight. The age calculator computes your precise age down to days and hours — perfect for official forms and birthday celebrations.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            For students and professionals who work with numbers daily, the percentage calculator handles everything from simple percentage-of-a-number to percentage increase and decrease calculations. And if you want something lighter, the love calculator offers a fun compatibility test using zodiac and numerology — great for sharing with friends on social media.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Accurate, Instant, and Free</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every calculator on VexaTool runs directly in your browser, providing instant results. There are no ads that block your view, no forced registrations, and no limits on how many calculations you can perform. The tools are designed with accuracy in mind, using standard mathematical formulas and industry-accepted methods.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </main>
      <Footer />
    </div>
  );
};

export default CalculatorTools;
