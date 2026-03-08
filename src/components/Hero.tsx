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
      className="relative py-16 sm:py-24 md:py-32 lg:py-36 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Layered CSS gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/[0.06] via-background to-secondary/[0.04]" />

      {/* Decorative blobs - pure CSS, zero network cost */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-8%] w-[400px] h-[400px] rounded-full bg-secondary/[0.05] blur-[80px] pointer-events-none" />
      <div className="absolute top-[20%] left-[15%] w-[200px] h-[200px] rounded-full bg-primary/[0.03] blur-[60px] pointer-events-none hidden md:block" />

      {/* Subtle grid pattern via inline SVG background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0v60' fill='none' stroke='%232563eb' stroke-opacity='0.06' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Decorative floating shapes */}
      <svg
        className="absolute top-12 right-[12%] w-16 h-16 sm:w-20 sm:h-20 text-primary/10 pointer-events-none hidden sm:block"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
      >
        <rect x="10" y="10" width="60" height="60" rx="16" stroke="currentColor" strokeWidth="1.5" />
        <rect x="22" y="22" width="36" height="36" rx="10" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg
        className="absolute bottom-16 left-[10%] w-14 h-14 sm:w-16 sm:h-16 text-secondary/10 pointer-events-none hidden sm:block"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg
        className="absolute top-[55%] right-[8%] w-10 h-10 text-primary/[0.07] pointer-events-none hidden lg:block"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <polygon points="20,2 38,38 2,38" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Small badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/[0.08] border border-primary/[0.12] mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Free & Secure Tools</span>
          </div>

          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold mb-4 md:mb-5 leading-[1.15] tracking-tight text-foreground"
          >
            Free Online Tools for
            <br className="hidden sm:block" />
            {" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PDF, Image & More
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg max-w-md mx-auto mb-8 md:mb-10 leading-relaxed text-muted-foreground">
            Merge, edit, compress and convert documents in seconds.
            No signup. 100% private.
          </p>

          <Link
            to="/all-tools"
            className="inline-flex items-center gap-2 px-7 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-200"
          >
            Explore All Tools
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="max-w-md mx-auto mt-12 md:mt-16">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {trustItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-card/80 shadow-sm border border-border/50 flex items-center justify-center">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-foreground/80 leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
