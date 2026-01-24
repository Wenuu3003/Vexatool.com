import { forwardRef } from "react";
import { Heart, Sparkles } from "lucide-react";

interface LoveShareCardProps {
  name1: string;
  name2: string;
  percentage: number;
  nameMatchScore: number;
  numerologyScore: number;
  compatibilityLevel: string;
  message: string;
}

export const LoveShareCard = forwardRef<HTMLDivElement, LoveShareCardProps>(
  ({ name1, name2, percentage, nameMatchScore, numerologyScore, compatibilityLevel, message }, ref) => {
    const isHighCompatibility = percentage >= 90;
    
    return (
      <div
        ref={ref}
        data-share-card="true"
        className="w-[360px] h-[640px] p-6 rounded-3xl text-white shadow-2xl overflow-hidden relative"
        style={{
          background: isHighCompatibility 
            ? "linear-gradient(135deg, #ec4899 0%, #f43f5e 30%, #ef4444 60%, #f97316 100%)"
            : "linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #a855f7 100%)",
        }}
      >
        {/* Decorative hearts background */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(12)].map((_, i) => (
            <Heart
              key={i}
              className="absolute"
              fill="white"
              style={{
                width: `${20 + Math.random() * 40}px`,
                height: `${20 + Math.random() * 40}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-6 h-6" fill="white" />
              <span className="text-lg font-semibold tracking-wide opacity-90">Love Calculator</span>
              <Heart className="w-6 h-6" fill="white" />
            </div>
            {isHighCompatibility && (
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
                ✨ Perfect Match! ✨
              </div>
            )}
          </div>

          {/* Names */}
          <div className="text-center my-4">
            <div className="text-2xl font-bold mb-2 drop-shadow-lg">{name1}</div>
            <div className="flex items-center justify-center gap-2 my-3">
              <div className="h-px w-12 bg-white/40"></div>
              <Heart className="w-8 h-8 text-white animate-pulse" fill="white" />
              <div className="h-px w-12 bg-white/40"></div>
            </div>
            <div className="text-2xl font-bold drop-shadow-lg">{name2}</div>
          </div>

          {/* Main Percentage Circle */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>
              
              {/* Circle background */}
              <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/30"></div>
              
              {/* Progress ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="85"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="85"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={534}
                  strokeDashoffset={534 - (534 * percentage) / 100}
                />
              </svg>
              
              {/* Percentage text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black drop-shadow-lg">{percentage}%</span>
                <span className="text-sm font-medium opacity-80 mt-1">{compatibilityLevel}</span>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <Sparkles className="w-5 h-5 mx-auto mb-1" />
              <div className="text-2xl font-bold">{nameMatchScore}%</div>
              <div className="text-xs opacity-80">Name Match</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <span className="text-xl">🔮</span>
              <div className="text-2xl font-bold">{numerologyScore}%</div>
              <div className="text-xs opacity-80">Numerology</div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center px-4 mb-4">
            <p className="text-sm font-medium opacity-90 leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="text-center pt-3 border-t border-white/20">
            <div className="flex items-center justify-center gap-2 text-sm opacity-80">
              <Heart className="w-4 h-4" fill="white" />
              <span className="font-medium">mypdfs.in/love-calculator</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

LoveShareCard.displayName = "LoveShareCard";
