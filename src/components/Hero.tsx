import { Shield, Zap, Smartphone, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const trustItems = [
  { icon: Lock, label: "No File Stored" },
  { icon: Shield, label: "100% Secure" },
  { icon: Smartphone, label: "Works on Mobile" },
  { icon: Zap, label: "Instant Results" },
];

export const Hero = () => {
  return (
    <section
      className="relative py-24 md:py-32 lg:py-36 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.webp"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            id="hero-heading"
            className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold mb-5 leading-[1.15] tracking-tight text-foreground"
          >
            Free Online Tools for
            <br className="hidden sm:block" />
            {" "}PDF, Image & More
          </h1>

          <p className="text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed text-muted-foreground">
            Merge, edit, compress and convert documents in seconds.
            No signup. 100% private. Works in your browser.
          </p>

          <Link
            to="/all-tools"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-200"
          >
            Explore All Tools
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="max-w-xl mx-auto mt-16">
          <div className="grid grid-cols-4 gap-3">
            {trustItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-1.5">
                <div className="w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm shadow-sm flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
