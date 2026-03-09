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
      {/* Base gradient: white → soft blue → hint of purple */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,hsl(0_0%_100%)_0%,hsl(220_65%_95%)_35%,hsl(245_55%_94%)_65%,hsl(225_30%_97%)_100%)]" />

      {/* Large blurred glow — top-right blue */}
      <div className="absolute -top-[15%] -right-[10%] w-[550px] h-[550px] rounded-full bg-primary/[0.14] blur-[120px] pointer-events-none" />

      {/* Large blurred glow — bottom-left purple */}
      <div className="absolute -bottom-[18%] -left-[8%] w-[480px] h-[480px] rounded-full bg-secondary/[0.12] blur-[110px] pointer-events-none" />

      {/* Mid glow — center-left soft blue */}
      <div className="absolute top-[30%] left-[20%] w-[260px] h-[260px] rounded-full bg-primary/[0.08] blur-[80px] pointer-events-none hidden md:block" />

      {/* Small accent glow — right side purple */}
      <div className="absolute top-[50%] right-[15%] w-[180px] h-[180px] rounded-full bg-secondary/[0.08] blur-[70px] pointer-events-none hidden lg:block" />

      {/* Center glow behind heading */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[400px] h-[250px] rounded-full bg-primary/[0.06] blur-[90px] pointer-events-none" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.55] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(217 91% 60% / 0.1) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Faint diagonal lines for texture */}
      <div
        className="absolute inset-0 z-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='60' x2='60' y2='0' stroke='%232563eb' stroke-opacity='0.08' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Decorative themed icons — very light, non-distracting */}
      {/* PDF document shape */}
      <svg
        className="absolute top-[12%] right-[11%] w-20 h-20 sm:w-24 sm:h-24 text-primary/[0.10] pointer-events-none hidden sm:block"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
      >
        <rect x="16" y="8" width="56" height="72" rx="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M28 28h32M28 40h24M28 52h28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M56 8v16h16" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Image/photo frame shape */}
      <svg
        className="absolute bottom-[14%] left-[8%] w-16 h-16 sm:w-20 sm:h-20 text-secondary/[0.11] pointer-events-none hidden sm:block"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
      >
        <rect x="8" y="12" width="64" height="52" rx="8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="28" cy="32" r="6" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 52l18-14 12 10 14-8 20 14" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>

      {/* QR code shape */}
      <svg
        className="absolute top-[55%] right-[6%] w-14 h-14 sm:w-16 sm:h-16 text-primary/[0.08] pointer-events-none hidden lg:block"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <rect x="8" y="8" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.3" />
        <rect x="36" y="8" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.3" />
        <rect x="8" y="36" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.3" />
        <rect x="40" y="40" width="4" height="4" fill="currentColor" opacity="0.5" />
        <rect x="48" y="40" width="4" height="4" fill="currentColor" opacity="0.5" />
        <rect x="40" y="48" width="4" height="4" fill="currentColor" opacity="0.5" />
        <rect x="48" y="48" width="12" height="4" fill="currentColor" opacity="0.5" />
      </svg>

      {/* Geometric accents — concentric rounded squares */}
      <svg
        className="absolute top-[8%] left-[6%] w-14 h-14 text-secondary/[0.05] pointer-events-none hidden md:block"
        viewBox="0 0 56 56"
        fill="none"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="48" height="48" rx="14" stroke="currentColor" strokeWidth="1" />
        <rect x="14" y="14" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="0.8" />
      </svg>

      {/* Small diamond shape */}
      <svg
        className="absolute bottom-[22%] right-[18%] w-8 h-8 text-primary/[0.04] pointer-events-none hidden xl:block"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1" transform="rotate(45 16 16)" />
      </svg>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/[0.07] border border-primary/[0.10] mb-5 backdrop-blur-sm">
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
            <span className="bg-gradient-to-r from-primary via-[hsl(230,80%,62%)] to-secondary bg-clip-text text-transparent">
              PDF, Image & More
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg max-w-md mx-auto mb-8 md:mb-10 leading-relaxed text-muted-foreground">
            Merge, edit, compress and convert documents in seconds.
            No signup. 100% private.
          </p>

          <Link
            to="/all-tools"
            className="inline-flex items-center gap-2 px-7 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:bg-primary/90 transition-all duration-200"
          >
            Explore All Tools
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="max-w-md mx-auto mt-12 md:mt-16">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {trustItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-card/80 backdrop-blur-sm shadow-sm border border-border/50 flex items-center justify-center">
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
