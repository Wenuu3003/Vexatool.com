import { Shield, Zap, Smartphone, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.webp"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            id="hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground drop-shadow-sm"
          >
            Free Online Tools – PDF, Image, QR & More
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed text-muted-foreground">
            Merge, edit, compress and convert PDFs in seconds.{" "}
            No signup required. 100% privacy-focused tools.
          </p>

          <Link
            to="/all-tools"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity"
          >
            Explore All Tools
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="max-w-3xl mx-auto mt-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Lock, label: "No File Stored" },
              { icon: Shield, label: "100% Secure Processing" },
              { icon: Smartphone, label: "Works on Mobile" },
              { icon: Zap, label: "Instant Results" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-card/80 backdrop-blur-sm shadow-sm flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
