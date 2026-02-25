import { forwardRef } from "react";
import { Heart, Sparkles, Star, User } from "lucide-react";
import type { ZodiacCompatibilityResult } from "@/lib/zodiacCompatibility";

interface LoveShareCardProps {
  name1: string;
  name2: string;
  photo1: string | null;
  photo2: string | null;
  percentage: number;
  nameMatchScore: number;
  numerologyScore: number;
  zodiacResult: ZodiacCompatibilityResult | null;
  compatibilityLevel: string;
  message: string;
}

export const LoveShareCard = forwardRef<HTMLDivElement, LoveShareCardProps>(
  ({ name1, name2, photo1, photo2, percentage, nameMatchScore, numerologyScore, zodiacResult, compatibilityLevel, message }, ref) => {
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
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-5 h-5" fill="white" />
              <span className="text-base font-semibold tracking-wide opacity-90">Love Calculator</span>
              <Heart className="w-5 h-5" fill="white" />
            </div>
            {isHighCompatibility && (
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
                ✨ Perfect Match! ✨
              </div>
            )}
          </div>

          {/* Photos and Names */}
          <div className="flex items-center justify-center gap-4 my-3">
            <div className="text-center">
              {photo1 ? (
                <img src={photo1} alt={name1} className="w-16 h-16 rounded-full object-cover border-3 border-white/50 mx-auto" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white/30">
                  <User className="w-8 h-8 text-white/70" />
                </div>
              )}
              <div className="text-lg font-bold mt-1 drop-shadow-lg">{name1}</div>
              {zodiacResult && <span className="text-xl">{zodiacResult.sign1.symbol}</span>}
            </div>
            
            <Heart className="w-8 h-8 text-white" fill="white" />
            
            <div className="text-center">
              {photo2 ? (
                <img src={photo2} alt={name2} className="w-16 h-16 rounded-full object-cover border-3 border-white/50 mx-auto" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white/30">
                  <User className="w-8 h-8 text-white/70" />
                </div>
              )}
              <div className="text-lg font-bold mt-1 drop-shadow-lg">{name2}</div>
              {zodiacResult && <span className="text-xl">{zodiacResult.sign2.symbol}</span>}
            </div>
          </div>

          {/* Main Percentage Circle */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>
              <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/30"></div>
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round"
                  strokeDasharray={440} strokeDashoffset={440 - (440 * percentage) / 100} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black drop-shadow-lg">{percentage}%</span>
                <span className="text-xs font-medium opacity-80 mt-1">{compatibilityLevel}</span>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className={`grid gap-2 my-3 ${zodiacResult ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
              <Sparkles className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xl font-bold">{nameMatchScore}%</div>
              <div className="text-[10px] opacity-80">Name</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
              <span className="text-base">🔮</span>
              <div className="text-xl font-bold">{numerologyScore}%</div>
              <div className="text-[10px] opacity-80">Numerology</div>
            </div>
            {zodiacResult && (
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
                <Star className="w-4 h-4 mx-auto mb-1" />
                <div className="text-xl font-bold">{zodiacResult.score}%</div>
                <div className="text-[10px] opacity-80">Zodiac</div>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="text-center px-2 mb-3">
            <p className="text-xs font-medium opacity-90 leading-relaxed line-clamp-2">{message}</p>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-white/20">
            <div className="flex items-center justify-center gap-2 text-xs opacity-80">
              <Heart className="w-3 h-3" fill="white" />
              <span className="font-medium">vexatool.com/love-calculator</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

LoveShareCard.displayName = "LoveShareCard";
