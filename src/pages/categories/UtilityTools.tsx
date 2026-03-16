import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Link } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MapPin, AlignLeft, Ruler, Shield, Zap, Wifi } from "lucide-react";
import securityVisualImg from "@/assets/graphics/security-visual.webp";

const tools = [
  { name: "PIN Code Generator", href: "/pincode-generator", icon: MapPin, desc: "Find Indian PIN codes by state, district, city with post office details", gradient: "from-pink-500 to-purple-600" },
  { name: "Word Counter", href: "/word-counter", icon: AlignLeft, desc: "Count words, characters, sentences and estimate reading time", gradient: "from-slate-500 to-gray-600" },
  { name: "Unit Converter", href: "/unit-converter", icon: Ruler, desc: "Convert between units of length, weight, temperature and more", gradient: "from-indigo-500 to-violet-500" },
];

const faqs = [
  { q: "How accurate is the PIN Code Generator?", a: "The database covers all Indian states and union territories with detailed post office information. Data is kept up to date with official India Post records." },
  { q: "Does the Word Counter work with all languages?", a: "Yes. The word counter works with any language and handles long documents effortlessly. It counts words, characters, sentences, paragraphs, and estimates reading time." },
  { q: "What units does the Unit Converter support?", a: "It supports length, weight, temperature, volume, area, speed, and more. Conversions are based on standard scientific conversion factors." },
  { q: "Do these tools require an internet connection?", a: "The PIN Code Generator needs internet for lookups. The Word Counter and Unit Converter work fully offline once the page loads." },
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
        <h1 className="text-4xl font-bold text-foreground mb-4">Free Online Utility Tools</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          Practical everyday tools for word counting, PIN code lookup, and unit conversion. Simple, fast, and free.
        </p>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
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

        {/* Content */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Tools for Daily Productivity</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            The Word Counter is essential for students, writers, bloggers, and content creators. It counts words, characters, sentences, and paragraphs in real time, with reading time estimation for blog posts and presentations.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The PIN Code Generator helps you find Indian postal codes quickly — useful when filling out forms, shipping packages, or verifying addresses. The database covers all Indian states and union territories.
          </p>
        </div>

        {/* Featured Visual: Privacy — FULL WIDTH */}
        <div className="mb-16 rounded-2xl border border-border bg-gradient-to-br from-purple-500/5 via-card to-pink-500/5 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            <div className="md:col-span-2 flex items-center justify-center p-6 md:p-8 order-2 md:order-1">
              <img
                src={securityVisualImg}
                alt="Secure browser-based utility tools"
                className="w-full max-w-md rounded-xl shadow-xl border border-border/40"
                loading="lazy"
                decoding="async"
                width={480}
                height={320}
              />
            </div>
            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center order-1 md:order-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Always Free, Always Available</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Like all VexaTool products, these utility tools are completely free with no registration required. They work on any device and deliver results instantly without server processing.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Zap, label: "Instant Results" },
                  { icon: Shield, label: "No Data Stored" },
                  { icon: Wifi, label: "Works Offline*" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">*Word Counter and Unit Converter work offline after page load</p>
            </div>
          </div>
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

export default UtilityTools;
