import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { MapPin, AlignLeft, Ruler } from "lucide-react";

const tools = [
  { name: "PIN Code Generator", href: "/pincode-generator", icon: MapPin, desc: "Find Indian PIN codes by state, district, city with post office details", gradient: "from-pink-500 to-purple-600" },
  { name: "Word Counter", href: "/word-counter", icon: AlignLeft, desc: "Count words, characters, sentences and estimate reading time", gradient: "from-slate-500 to-gray-600" },
  { name: "Unit Converter", href: "/unit-converter", icon: Ruler, desc: "Convert between units of length, weight, temperature and more", gradient: "from-indigo-500 to-violet-500" },
];

const UtilityTools = () => {
  return (
    <div className="min-h-screen bg-background">
      <CanonicalHead
        title="Free Utility Tools Online – PIN Code Finder, Word Counter & More | VexaTool"
        description="Use VexaTool's free online utility tools including Indian PIN Code finder and Word Counter. Practical everyday tools, fast and easy."
        keywords="utility tools online, PIN code finder, word counter, pincode generator India, character counter, text analyzer"
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl font-bold text-foreground mb-6">Free Online Utility Tools</h1>
        
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-muted-foreground leading-relaxed">
            Not every task requires a specialized application. Sometimes you just need a quick tool to look up a postal code, count the words in your essay, or check a character limit. VexaTool's utility tools are built for exactly these everyday tasks — simple, fast, and available whenever you need them.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            These practical tools are designed with simplicity in mind. No unnecessary features, no confusing interfaces — just the functionality you need, delivered instantly in your browser. Whether you are a student checking word count requirements, a writer tracking article length, or someone looking up a postal code for a delivery address, these tools save you time.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Tools for Daily Productivity</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Word Counter is an essential tool for students, writers, bloggers, and content creators. It counts words, characters (with and without spaces), sentences, and paragraphs in real time as you type. It also estimates reading time, which is helpful for blog posts and presentations. The tool works with any language and handles long documents effortlessly.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            The PIN Code Generator helps you find Indian postal codes quickly. Search by state, district, or city name and get complete information including post office details. This is especially useful when filling out forms, shipping packages, or verifying addresses. The database covers all Indian states and union territories.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Always Free, Always Available</h2>
          <p className="text-muted-foreground leading-relaxed">
            Like all VexaTool products, these utility tools are completely free to use with no registration required. They work on any device — desktop, tablet, or mobile phone — and deliver results instantly without any server processing. Your data stays in your browser, ensuring complete privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href} className="group p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h3>
              </div>
              <p className="text-muted-foreground">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UtilityTools;
